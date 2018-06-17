export const KoCalendarConstants = {
  rulerColumnWidthNum: 40,
  rulerColumnWidth: '40px',
  rulerColumnHeightNum: 60,
  rulerColumnHeight: '60px',

  dayFormat: 'MM-DD (ddd)',

  dayColumnWidthNum: 200,
  dayColumnWidth: '200px',
  dayTitleHeight: '25px',

  tileBackgroundColor: '#0070E0',
  tileTimeFormat: 'h:mma',

  presentationTileBackgroundColor: '#FFEB3B',

  helpVideoLink: 'https://youtu.be/kCc5v-SuLX4',
}

export const DateConstants = {
  dateFormat: 'YYYY-MM-DD',
  hourFormat: 'h A',
  hourMinFormat: 'h:mm A',
  timezone: 'America/New_York',
}

export const SchedulingCalendarConstants = {
  containerWidthNum: 800,
  containerWidth: '800px',
  containerLeftPaddingNum: 16,
  containerLeftPadding: '16px',
  containerRightPaddingNum: 16,
  containerRightPadding: '16px',

  rowHeightNum: 60,
  rowHeight: '60px',

  columnWidthNum: 100,
  columnWidth: '100px',

  facultyColumnWidthNum: 200,
  facultyColumnWidth: '200px',

  tileBackgroundColor: '#0070E0',
  tileHeight: '60px',
}

export const ScheduleFormLayoutConstants = {
  layoutWithColumn: {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 17 },
    },
  },
  layoutWithoutColumn: {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 17,
        offset: 7,
      },
    },
  }
}