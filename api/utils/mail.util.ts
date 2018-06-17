import * as nodemailer from 'nodemailer';
import { escape } from 'lodash';

import Util from './util';
import DBUtil from './db.util';

export enum MailType {
  invitation,
  passwordreset,
  verify,
  welcome,
  verifycode,
  presentation,
  presentationcancel,
  presentationreminder,
  adminemail,
}

interface MailOption {
  to: string[];
  extra?: any;
  sent_by?: string;
}

const MAIL_CONSTANTS = {
  from: 'karai@knights.ucf.edu',
}

let transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  }
})

export default class Mailer {
  static send(type: MailType, option: MailOption) {
    let p = undefined;
    const key = MailType[type];

    // Log send status and handle error here
    if (type === MailType.invitation) {
      p = this.sendInvitation(option);
    } else if (type === MailType.passwordreset) {
      p = this.sendPasswordreset(option);
    } else if (type === MailType.verify) {
      p = this.sendVerify(option);
    } else if (type === MailType.welcome) {
      p = this.sendWelcome(option);
    } else if (type === MailType.verifycode) {
      p = this.sendVerifycode(option);
    } else if (type === MailType.presentation) {
      p = this.sendPresentation(option);
    } else if (type === MailType.presentationcancel) {
      p = this.sendPresentationcancel(option);
    } else if (type === MailType.presentationreminder) {
      p = this.sendPresentationreminder(option);
    } else if (type === MailType.adminemail) {
      p = this.sendAdminemail(option);
    } else {
      return Promise.resolve();
    }

    const newEmail: any = {
      key,
      to: option.to,
      extra: option.extra,
      result: {
        accepted: [],
        rejected: [],
      }
    };
    if (option.sent_by) {
      newEmail.sent_by = option.sent_by;
    }

    return p
      .then((result: any) => {
        newEmail.result = {
          accepted: result.accepted,
          rejected: result.rejected,
        }
        DBUtil.createEmail(newEmail);
      })
      .catch((err: any) => {
        newEmail.err = err;
        DBUtil.createEmail(newEmail);
      })
  }

  private static sendInvitation(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] ${option.extra.fromWhom} invited you to join!`,
      text: MailTemplate.invitationText1(option),
      html: MailTemplate.invitationHtml1(option),
    };

    return transporter.sendMail(mailOption);
  }

  private static sendPasswordreset(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] Password reset email`,
      text: MailTemplate.passwordresetText(option),
      html: MailTemplate.passwordresetHtml(option),
    }

    return transporter.sendMail(mailOption);
  }

  private static sendVerify(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] Email verification`,
      text: MailTemplate.verifyText(option),
      html: MailTemplate.verifyHtml(option),
    }

    return transporter.sendMail(mailOption);
  }

  private static sendWelcome(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] Welcome to SD Scheduler!`,
      text: MailTemplate.welcomeText(option),
      html: MailTemplate.welcomeHtml(option),
    }

    return transporter.sendMail(mailOption);
  }

  private static sendVerifycode(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] Verify you belong to the group ${option.extra.groupNumber}`,
      text: MailTemplate.verifycodeText(option),
      html: MailTemplate.verifycodeHtml(option),
    }

    return transporter.sendMail(mailOption);
  }

  private static sendPresentation(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] ${option.extra.title}`,
      text: MailTemplate.presentationText(option),
      html: MailTemplate.presentationHtml(option),
    }

    return transporter.sendMail(mailOption);
  }

  private static sendPresentationcancel(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] ${option.extra.title}`,
      text: MailTemplate.presentationcancelText(option),
      html: MailTemplate.presentationcancelHtml(option),
    }

    return transporter.sendMail(mailOption);
  }

  private static sendPresentationreminder(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] ${option.extra.title}`,
      text: MailTemplate.presentationreminderText(option),
      html: MailTemplate.presentationreminderHtml(option),
    }

    return transporter.sendMail(mailOption);
  }

  private static sendAdminemail(option: MailOption) {
    const mailOption = {
      from: MAIL_CONSTANTS.from,
      to: option.to,
      subject: `[SD Scheduler] ${option.extra.title}`,
      text: MailTemplate.adminemailText(option),
      html: MailTemplate.adminemailHtml(option),
    }

    return transporter.sendMail(mailOption);
  }
}

export class MailTemplate {
  /**
   * Invitation
   */

  static invitationText1(option: MailOption) {
    return `
    ${option.extra.fromWhom} invited you to join SD Scheduler!
    Please set the password at ${Util.siteUrl()}/password/${option.extra.token}

    ...? What is SD Scheduler?

    Hi, my name is Kohei Arai. I'm project owner/developer of SD Scheduler. I took Senior Design 2 at 2017 Fall.
    The project went well. However, the final presentation arrangement was not fun at all.

    All senior design groups have to go ask professors and send emails to check availability.
    Then, some group took a spot other group is requesting; start over to ask if the different time slot is fine.

    This is as much as painful for professors as well. Professors have to keep track of WHO and WHEN presentation happens.
    Faculties have to reply/tell available time over and over; then sign the PDF for all presentations.
    
    We are living in the time that AI defeats the best go player.
    There should be a better way...


    SD Scheduler is the answer to this outdated presentation arrangement problem.
    With SD Scheduler, final presentation arrangement changes like this:
    * Faculties fill available time through easy and intuitive interface
    * Students check faculty's available time. Pick faculties and select 1 hour time slot
    * Faculties can check scheduled presentation in one place
    * The system sends signed PDF and reminder email before the presentation.
    
    Easy and intuitive interface to fill faculty's available time. 

    Students can schedule the final presentation with no stress.

    Faculties have access to nice calendar to check presentation status.

    SD Scheduler automatically signs the PDF for you.

    
    Still feel unsecure to use SD Scheduler?
    All source is hosted on Github. Please check the source code upside down to find the security issue.
    https://github.com/1kohei1/sd-scheduler

    If you find security issues, please let me know at karai@knights.ucf.edu.
    I will update as soon as possible!

    Sincerely,

    Kohei
  `;
  }

  static invitationText2(option: MailOption) {
    return `
    ${option.extra.fromWhom} invited you to join SD Scheduler!
    Please set the password at ${Util.siteUrl()}/password/${option.extra.token}

    ...? What is SD Scheduler?

    SD Scheduler is the project developed by the student who took 2017 Fall Senior Design.
    He is so stressed that faculties and students have to arrange the presentation with old fashioned tool like email and paper.
    As a computer science student, he thought what could be done better.

    SD Scheduler is the answer to outdated presentation arrangement.
    The project devotes to solve below problems:
    * Faculties have to keep track of WHO and WHEN presentation happens
    * Faculties have to tell available time OVER and OVER
    * Faculties have to sign the PDF document for ALL groups
    
    SD Scheduler offers easy and intuitive way to fill your available time. 

    You will have one place to check when the presentation happens.

    SD Scheduler automatically signs the PDF for you.

    
    Still feel unsecure to use SD Scheduler?
    All source is hosted on Github. Please check the source code upside down to detect the security issue.
    https://github.com/1kohei1/sd-scheduler

    If you find security issues, please let me know at karai@knights.ucf.edu.
    I will update as soon as possible!

    Sincerely,

    Kohei
  `;
  }

  static invitationHtml1(option: MailOption) {
    return MailTemplate.htmlTemplate(`
      ${option.extra.fromWhom} invited you to join SD Scheduler!<br />
      Please set the password at <a href="${Util.siteUrl()}/password/${option.extra.token}" target="_blank">${Util.siteUrl()}/password/${option.extra.token}</a>

      <h3>...? What is SD Scheduler?</h3>
  
      Hi, my name is Kohei Arai. I'm project owner/developer of SD Scheduler. I took Senior Design 2 at 2017 Fall.<br />
      The project went well. However, the final presentation arrangement was not fun at all.<br />
      <br />
      All senior design groups have to go ask professors and send emails to check availability.<br />
      Then, some group took a spot other group is requesting; start over to ask if the different time slot is fine.<br />
      <br />
      This is as much as painful for professors as well. Professors have to keep track of WHO and WHEN presentation happens.<br />
      Faculties have to reply/tell available time over and over; then sign the PDF for all presentations.<br />
      <br />    
      We are living in the time that AI defeats the best go player.<br />
      There should be a better way...<br />
      <br />
      <br />
      SD Scheduler is the answer to this outdated presentation arrangement problem.<br />
      With SD Scheduler, final presentation arrangement changes like this:<br />
      <ul>
        <li>Faculties fill available time through easy and intuitive interface</li>
        <li>Students check faculty's available time. Pick faculties and select 1 hour time slot</li>
        <li>Faculties can check scheduled presentation in one place</li>
        <li>The system sends signed PDF and reminder email before the presentation.</li>
      </ul>
      
      Easy and intuitive interface to fill faculty's available time. <br />
      [IMAGE]<br />
      <br />
      Students can schedule the final presentation with no stress.<br />
      [IMAGE]<br />
      <br />
      Faculties have access to nice calendar to check presentation status.<br />
      [IMAGE]<br />
      <br />
      SD Scheduler automatically signs the PDF for you.<br />
      [IMAGE]<br />
      <br />
      <br />      
      Still feel unsecure to use SD Scheduler?<br />
      All source is hosted on Github. Please check the source code upside down to find the security issue.<br />
      <a href="https://github.com/1kohei1/sd-scheduler" target="_blank">https://github.com/1kohei1/sd-scheduler</a><br />
      <br />
      If you find security issues, please let me know at karai@knights.ucf.edu.<br />
      I will update as soon as possible!<br />
      <br />
      Sincerely,<br />
      <br />
      Kohei<br />
    `);
  }

  static invitationHtml2(option: MailOption) {
    return MailTemplate.htmlTemplate(`
      ${option.extra.fromWhom} invited you to join SD Scheduler!<br />
      Please set the password at <a href="${Util.siteUrl()}/password/${option.extra.token}" target="_blank">${Util.siteUrl()}/password/${option.extra.token}</a><br />
  
      <h3>...? What is SD Scheduler?</h3>
  
      SD Scheduler is the project developed by the student who took 2017 Fall Senior Design.<br />
      He is so stressed that faculties and students have to arrange the presentation with old fashioned tool like email and paper.<br />
      As a computer science student, he thought what could be done better.<br />
      <br />
      SD Scheduler is the answer to outdated presentation arrangement.<br />
      The project devotes to solve below problems:<br />
      <ul>
        <li>Faculties have to keep track of WHO and WHEN presentation happens</li>
        <li>Faculties have to tell available time OVER and OVER</li>
        <li>Faculties have to sign the PDF document for ALL groups</li>
      </ul>
      
      SD Scheduler offers easy and intuitive way to fill your available time. <br />
      [IMAGE]<br />
  
      You will have one place to check when the presentation happens.<br />
      [IMAGE]<br />
  
      SD Scheduler automatically signs the PDF for you.<br />
      [IMAGE]<br />
      <br />
      <br />
      Still feel unsecure to use SD Scheduler?<br />
      All source is hosted on Github. Please check the source code upside down to find the security issue.<br />
      <a href="https://github.com/1kohei1/sd-scheduler" target="_blank">https://github.com/1kohei1/sd-scheduler</a><br />
      <br />
      If you find security issues, please let me know at karai@knights.ucf.edu.<br />
      I will update as soon as possible!<br />
      <br />
      Sincerely,<br />
      <br />
      SD Scheduler team<br />
    `);
  }

  static passwordresetText(option: MailOption) {
    return `
    Hi ${option.extra.name},

    You've requested the password reset. Please reset your password here: ${Util.siteUrl()}/password/${option.extra.token}

    This reset link expires in 30 minutes.<br />

    Sincerely,

    SD Scheduler team
    `;
  }

  static passwordresetHtml(option: MailOption) {
    return MailTemplate.htmlTemplate(`
    Hi ${option.extra.name}<br />
    <br />
    You've requested the password reset. Please reset your password here: <a href="${Util.siteUrl()}/password/${option.extra.token}" target="_blank">${Util.siteUrl()}/password/${option.extra.token}</a><br />
    <br />
    This reset link expires in 30 minutes.<br />
    <br />
    Sincerely,<br />
    <br />
    SD Scheduler team<br />
    `);
  }

  static verifyText(option: MailOption) {
    return `
    Hi ${option.extra.name},

    Please click this link to verify your email address
    ${Util.siteUrl()}/verify/${option.extra.token}

    Sincerely,

    SD Scheduler team
    `
  }

  static verifyHtml(option: MailOption) {
    return MailTemplate.htmlTemplate(`
    Hi ${option.extra.name},<br />
    <br />
    Please click this link to verify your email address. <br />
    <a href="${Util.siteUrl()}/verify/${option.extra.token}" target="_blank">${Util.siteUrl()}/verify/${option.extra.token}</a>
    <br />
    Sincerely,<br />
    <br />
    SD Scheduler team<br />
    `);
  }

  static welcomeText(option: MailOption) {
    return `
    Hi ${option.extra.name},

    Thanks for using SD Scheduler! We committed to provide easy interface to fill your available time.
    Please check at ${Util.siteUrl()}/dashboard/${Util.currentSemesterKey()}/calendar

    Sincerely,

    SD Scheduler team
    `
  }

  static welcomeHtml(option: MailOption) {
    return MailTemplate.htmlTemplate(`
    Hi ${option.extra.name},<br />
    <br />
    Thanks for using SD Scheduler! We committed to provide easy interface to fill your available time.<br />
    Please check at <a href="${Util.siteUrl()}/dashboard/${Util.currentSemesterKey()}/calendar" target="_blank">${Util.siteUrl()}/dashboard/${Util.currentSemesterKey()}/calendar</a><br />
    <br />
    Sincerely,<br />
    <br />
    SD Scheduler team<br />
    `);
  }

  static verifycodeText(option: MailOption) {
    return `
    Hi ${option.extra.name},

    Your verification code is:

    ${option.extra.code}

    This code expires in 15 minutes.

    Sincerely,

    SD Scheduler team
    `
  }

  static verifycodeHtml(option: MailOption) {
    return MailTemplate.htmlTemplate(`
      Hi ${option.extra.name},<br />
      <br />
      Your verification code is:<br />
      <br />
      <div style="font-size: 20px">${option.extra.code}</div>
      <br />
      This code expires in 15 minutes.<br />
      <br />
      Sincerely,<br />
      <br />
      SD Scheduler team<br />
    `)
  }

  static presentationText(option: MailOption) {
    let url = '';
    if (option.extra.type === 'faculty') {
      url = `${Util.siteUrl()}/dashboard/${Util.currentSemesterKey()}/calendar`;
    } else if (option.extra.type === 'group') {
      url = `${Util.siteUrl()}/calendar`;
    }

    let calendarLink = '';
    if (url) {
      calendarLink = `
      You can check your scheduled presentations at ${url}.
      <br />
      `
    }
    return `
    Hi ${option.extra.name},

    ${option.extra.title}.

    You can check presentation schedule
    ${calendarLink}

    Sincerely,

    SD Scheduler team
    `
  }

  static presentationHtml(option: MailOption) {
    let url = '';
    if (option.extra.type === 'faculty') {
      url = `${Util.siteUrl()}/dashboard/${Util.currentSemesterKey()}/calendar`;
    } else if (option.extra.type === 'group') {
      url = `${Util.siteUrl()}/calendar`;
    }

    let calendarLink = '';
    if (url) {
      calendarLink = `
      You can check your scheduled presentations at <a href="${url}">${url}</a><br />
      `
    }

    return MailTemplate.htmlTemplate(`
    Hi ${option.extra.name},<br />
    <br />
    ${option.extra.title}.<br />
    ${calendarLink}
    <br />
    Sincerely,<br />
    <br />
    SD Scheduler team<br />
    `);
  }

  static presentationcancelText(option: MailOption) {
    return `
    Hi ${option.extra.name},

    ${option.extra.title}.

    Message from ${option.extra.canceledBy}: 
    ${option.extra.note}

    ${option.extra.type === 'group' ? `Please schedule presentation again at ${Util.siteUrl()}/schedule` : ''}

    Sincerely,

    SD Scheduler team
    `;
  }

  static presentationcancelHtml(option: MailOption) {
    return MailTemplate.htmlTemplate(`
    Hi ${option.extra.name},<br />
    <br />
    ${option.extra.title}.<br />
    <br />
    Message from ${option.extra.canceledBy}:<br />
    ${option.extra.note}<br />
    ${option.extra.type === 'group' ? `<br />Please schedule presentation again at <a href="${Util.siteUrl()}/schedule">${Util.siteUrl()}/schedule</a><br />` : ''}
    <br />
    Sincerely,<br />
    <br />
    SD Scheduler team<br />
    `);
  }

  static presentationreminderText(option: MailOption) {
    return `
    Hi ${option.extra.name},

    ${option.extra.title}.

    Sincerely,

    SD Scheduler team
    `
  }

  static presentationreminderHtml(option: MailOption) {
    return MailTemplate.htmlTemplate(`
    Hi ${option.extra.name},<br />
    <br />
    ${option.extra.title}.<br />
    <br />
    Sincerely,<br />
    <br />
    SD Scheduler team<br />
    `);
  }

  static adminemailText(option: MailOption) {
    return MailTemplate.convertToEmailText(option.extra.content);
  }

  static adminemailHtml(option: MailOption) {
    return MailTemplate.convertToEmailHtml(option.extra.content);
  }

  static htmlTemplate(content: string) {
    return `
      <div style="max-width: 500px; margin: auto; font-family: Helvetica Neue For Number,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif; font-size: 14px">
        <div style="height: 64px; line-height: 64px; background-color: #041528; color: #fff; padding: 0 16px; font-size: 14px;">
          SD Scheduler
        </div>
        <div style="padding: 0 16px 16px 16px; border: 1px solid #e8e8e8; border-top: 0 solid #e8e8e8">
          <br />
          ${content}
        </div>
      </div>
    `
  }

  static terms() {
    return [{
      key: 'TOP',
      link: `${Util.siteUrl()}/`,
    }, {
      key: 'LOGIN',
      link: `${Util.siteUrl()}/login`,
    }, {
      key: 'PASSWORD',
      link: `${Util.siteUrl()}/password`,
    }, {
      key: 'ACCOUNT',
      link: `${Util.siteUrl()}/account`,
    }, {
      key: 'DASHBOARD',
      link: `${Util.siteUrl()}/dashboard`,
    }, {
      key: 'DASHBOARD_CALENDAR',
      link: `${Util.siteUrl()}/dashboard/${Util.currentSemesterKey()}/calendar`,
    }, {
      key: 'SEMESTER_CALENDAR',
      link: `${Util.siteUrl()}/calendar`,
    }, {
      key: 'SCHEDULE',
      link: `${Util.siteUrl()}/schedule`,
    }];
  }

  static convertToEmailText(content: string) {
    // Terms are replaced with the link
    return MailTemplate.convertTermsToLinks(content, true);
  }

  static convertToEmailHtml(content: string) {
    content = escape(content);
    content = MailTemplate.convertNewlinesToBr(content);
    content = MailTemplate.convertTermsToLinks(content, false);
    return MailTemplate.htmlTemplate(content);
  }

  private static convertNewlinesToBr(content: string) {
    return content.replace(/\n/g, '<br />');
  }

  private static convertTermsToLinks(content: string, isForText: boolean) {
    const terms = MailTemplate.terms();

    terms.forEach(term => {
      // Handle no text in the tag such as  <PASSWORD></PASSWORD>
      let regex = new RegExp(`&lt;${term.key}&gt;&lt;/${term.key}&gt;`, 'g');
      content = content.replace(regex, MailTemplate.replaceStr(term.link, term.link, isForText));
      // Handle text in the tag such as <PASSWORD>abc</PASSWORD>
      // Reference for the regex taking characters that's up to specified character: https://stackoverflow.com/a/7124976/4155129
      regex = new RegExp(`&lt;${term.key}&gt;(.+?(?=&lt;))&lt;/${term.key}&gt;`, 'g');
      content = content.replace(regex, (match: string, text: string) => MailTemplate.replaceStr(term.link, text, isForText));
    });

    return content;
  }

  private static replaceStr(link: string, text: string, isForText: boolean) {
    if (isForText) {
      return `${link}`;
    } else {
      return `<a href="${link}" target="_blank">${text}</a>`
    }
  }
}