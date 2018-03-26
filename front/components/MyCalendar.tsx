import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import { Button, Icon, message, Alert, Popover, Modal, Form, Input, Checkbox } from 'antd';

import KoCalendar from './KoCalendar/KoCalendar';
import Presentation from '../models/Presentation';
import { DateConstants, KoCalendarConstants } from '../models/Constants';
import { Semester } from '../models/Semester';
import DatetimeUtil, { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import TimeSlot from '../models/TimeSlot';
import Loading from './Loading';
import Api from '../utils/Api';
import AvailableSlot from '../models/AvailableSlot';
import PresentationDate from '../models/PresentationDate';
import Faculty from '../models/Faculty';
import Location from '../models/Location';
import CookieUtil from '../utils/CookieUtil';

export interface MyCalendarProps {
  user: Faculty;
  semester: Semester;
}

interface MyCalendarState {
  loading: boolean;
  errors: List<string>;
  presentations: List<Presentation>;
  availableSlots: List<TimeSlot>;
  presentationDates: TimeSlot[];
  locations: Location[];
  helpDialogVisible: boolean;
}

export default class MyCalendar extends React.Component<MyCalendarProps, MyCalendarState> {
  availableSlotId: string | undefined = undefined;

  constructor(props: MyCalendarProps) {
    super(props);

    this.state = {
      loading: true,
      errors: List<string>(),
      presentations: List<Presentation>(),
      availableSlots: List<TimeSlot>(),
      presentationDates: [],
      locations: [],
      helpDialogVisible: false,
    };

    this.onAvailableSlotChange = this.onAvailableSlotChange.bind(this);
    this.calendar = this.calendar.bind(this);
    this.alert = this.alert.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.cancelPresentation = this.cancelPresentation.bind(this);
  }

  componentDidMount() {
    Promise.all([
      this.getPresentationDates(),
      this.getLocations(),
      this.getAvailableSlot(),
      this.getPresentations(),
    ])
      .then(() => {
        this.setState({
          loading: false,
        });

        if (!CookieUtil.getHideDialog()) {
          // Let user see there is a calendar, then present a dialog to solve user problem
          setTimeout(() => {
            this.setState({
              helpDialogVisible: true,
            })
          }, 1500);
        }
      })
  }

  onError(err: any) {
    this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
      return {
        errors: prevState.errors.push(err.message),
      }
    });
  }

  private async getPresentationDates() {
    try {
      const presentationDates = await Api.getPresentationDates(`semester=${this.props.semester._id}`) as PresentationDate[];
      const presentationSlots = DatetimeUtil.getPresentationSlots(presentationDates);

      this.setState({
        presentationDates: presentationSlots,
      });
    } catch (err) {
      this.onError(err);
    }
  }

  private async getLocations() {
    try {
      const query = `semester=${this.props.semester._id}`;
      const locations = await Api.getLocations(query);
      this.setState({
        locations,
      })
    } catch (err) {
      this.onError(err);
    }
  }

  private async getAvailableSlot() {
    try {
      const semesterId = this.props.semester._id;
      const facultyId = this.props.user._id;

      const availableSlots = await Api.getAvailableSlots(`semester=${semesterId}&faculty=${facultyId}`) as AvailableSlot[];

      if (availableSlots.length > 0) {
        this.onAvailableSlotGet(availableSlots[0]);
      } else {
        const availableSlot = await Api.createAvailableSlot({
          semester: semesterId,
          faculty: facultyId,
          availableSlots: [],
        });

        this.onAvailableSlotGet(availableSlot);
      }
    } catch (err) {
      this.onError(err);
    }
  }

  private onAvailableSlotGet(availableSlot: AvailableSlot) {
    this.availableSlotId = availableSlot._id;
    let availableSlots = List<TimeSlot>();

    availableSlot.availableSlots.forEach(slot => {
      availableSlots = availableSlots.push(DatetimeUtil.convertToTimeSlot(slot))
    });

    this.setState({
      availableSlots,
    });
  }

  private async getPresentations() {
    try {
      const presentationQuery = `semester=${this.props.semester._id}&faculties[$in][]=${this.props.user._id}`;
      let presentations = await Api.getPresentations(presentationQuery);
      presentations = List(presentations);

      this.setState({
        presentations,
      });
    } catch (err) {
      this.onError(err);
    }
  }

  onAvailableSlotChange(updatedSlot: TimeSlot, isDelete: boolean, updateDB: boolean = false) {
    const index = this.state.availableSlots.findIndex(slot => {
      if (slot) {
        return slot._id === updatedSlot._id;
      } else {
        return false;
      }
    });

    this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
      let newAvailableSlots = prevState.availableSlots;

      if (isDelete && index >= 0) {
        newAvailableSlots = newAvailableSlots.delete(index);
      } else if (index >= 0) {
        newAvailableSlots = newAvailableSlots.set(index, updatedSlot);
      } else {
        newAvailableSlots = newAvailableSlots.push(updatedSlot);
      }

      if (updateDB) {
        this.canUpdateDBAvailableSlot(newAvailableSlots.toArray())
          .then(updateDB => {
            if (updateDB) {
              this.updateDBAvailableSlot(newAvailableSlots.toArray());
            } else {
              // If the faculty cancels deleting the presentation, fetch most updated available slots
              this.getAvailableSlot();
            }
          })
      }
      return {
        availableSlots: newAvailableSlots,
      }
    })
  }

  private confirmDialogContent() {
    return (
      <div>
        The system will cancel the presentation and send the emails to sponsors and group members. Please leave message to them why you have to cancel this presentation.<br /><br />
        <Form>
          <Form.Item
            help="Please enter the message"
          >
            <Input
              id="note"
            />
          </Form.Item>
        </Form>
      </div>
    )
  }

  private async canUpdateDBAvailableSlot(newAvailableSlots: TimeSlot[]) {
    const presentations = this.state.presentations.toArray();

    const presentationsToBeCanceled = presentations
      // Get presentations that group has to reschedule
      .filter(presentation => {
        const presentationTimeSlot = DatetimeUtil.convertToTimeSlot(presentation as TimeSlotLikeObject);

        // If no availableSlot which covers presentation time is found, that means they have to reschedule
        return newAvailableSlots.filter(
          (slot: TimeSlot) => DatetimeUtil.doesCover(slot, presentationTimeSlot)
        )
          .length === 0
      })

    if (presentationsToBeCanceled.length > 0) {
      return new Promise((resolve, reject) => {
        Modal.confirm({
          title: 'Some group has to reschedule the presentation',
          content: this.confirmDialogContent(),
          okText: 'Cancel the presentation',
          cancelText: 'Go back',
          onOk: (closeFn: any) => {
            const note = (document.getElementById('note') as HTMLInputElement).value;
            if (note) {
              // Cancel each presentation
              presentationsToBeCanceled.forEach(presentation => this.cancelPresentation(presentation, note));
              closeFn();
              resolve(true);
            } else {
              message.error('Please leave the message to the group and sponsors');
            }
          },
          onCancel: () => {
            resolve(false);
          }
        })
      })
    } else {
      return Promise.resolve(true);
    }
  }

  async cancelPresentation(presentation: Presentation, note: string) {
    try {
      await Api.cancelPresentation(presentation._id, {
        canceledBy: this.props.user._id,
        note,
      });
      // Update presentations
      this.getPresentations();
      message.success('Successfully canceled the presentation');
    } catch (err) {
      this.onError(err);
    }
  }

  private async updateDBAvailableSlot(newAvailableSlots: TimeSlot[]) {
    try {
      if (this.availableSlotId) {
        await Api.updateAvailableSlot(this.availableSlotId, {
          availableSlots: newAvailableSlots
        });
        message.success('Successfully updated your available time!');
      }
    } catch (err) {
      this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
        return {
          errors: prevState.errors.push(err.message),
        }
      });
    }
  }

  modal() {
    return (<Modal
      title="How to mark your available time?"
      visible={this.state.helpDialogVisible}
      width="60%"
      destroyOnClose={true}
      footer={null}
      bodyStyle={{ padding: 0 }}
      onOk={(e) => this.toggleModal(false)}
      onCancel={(e) => this.toggleModal(false)}
    >
      <div>
        <div className="modal-container">
          <iframe
            src="https://www.youtube.com/embed/kCc5v-SuLX4?rel=0&amp;showinfo=0"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        <div style={{ padding: '16px' }}>
          <Checkbox
            defaultChecked={CookieUtil.getHideDialog()}
            onChange={(e) => CookieUtil.setHideDialog(e.target.checked)}
          >
            Don't show the help dialog from the next time (You can check this video by clicking "How to mark available time" button.)
          </Checkbox>
        </div>
      </div>
      {/* Link of how to put iframe relative to the parent size https://stackoverflow.com/a/35153397/4155129 */}
      <style jsx>{`
        /* This element defines the size the iframe will take.
        In this example we want to have a ratio of 25:14 */
        .modal-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56%; /* The height of the item will now be 56% of the width. */
        }
        
        /* Adjust the iframe so it's rendered in the outer-width and outer-height of it's parent */
        .modal-container iframe {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
        }
      `}</style>
    </Modal>)
  }

  calendar() {
    if (this.state.loading) {
      return <Loading />
    }

    return (
      <div>
        {this.modal()}
        <p>
          <Button
            icon="question-circle"
            onClick={(e) => this.toggleModal(true)}
          >
            How to mark available time
        </Button>
        </p>
        <p>Please mark your available time.</p>
        {/* <p>
          You will not be booked in a row if you need to move to a different location.
          <Popover
            title="What does this mean?"
            content={this.content()}
            placement="bottom"
          >
            <Icon type="question-circle" style={{ marginLeft: '8px' }} />
          </Popover>
        </p> */}
        {this.state.presentationDates.length === 0 ? (
          <div>Presentation dates are not defined. Once the date is set, the system sends email. Please check later!</div>
        ) : (
            <KoCalendar
              presentationDates={this.state.presentationDates}
              presentations={this.state.presentations.toArray()}
              availableSlots={this.state.availableSlots.toArray()}
              locations={this.state.locations}
              onAvailableSlotChange={this.onAvailableSlotChange}
              cancelPresentation={this.cancelPresentation}
            />
          )}
      </div>
    )
  }

  content() {
    return (
      <div style={{ width: '500px' }}>
        There could be a case that two senior design class holds presentations on the same date at different location. In that case, the system doesn't allow you to be booked in a row from a different class.
      </div>
    )
  }

  alert(message: string, index: number) {
    return (
      <Alert
        key={index}
        message="Error"
        showIcon
        description={(
          <div>
            {message}. To check your available time in DB, please <a href="">reload</a>.
          </div>
        )}
        type="error"
        style={{ marginBottom: '16px' }}
      />
    )
  }

  toggleModal(v: boolean) {
    this.setState({
      helpDialogVisible: v,
    })
  }

  render() {
    return (
      <div className="ko-mycalendar-wrapper">
        <div className="errors">
          {this.state.errors.map(this.alert)}
        </div>
        <div>
          <h1>My Calendar</h1>
          {this.calendar()}
        </div>
      </div>
    );
  }
}