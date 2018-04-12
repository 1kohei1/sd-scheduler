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
  rowHeightNum: 60,
  rowHeight: '60px',

  columnWidthNum: 100,
  columnWidth: '100px',

  tileBackgroundColor: '#0070E0',
  tileHeight: '18px',

  presentationTileDefaultGroup: '#FF6C40',
  presentationTileYouGroup: '#FFEB3B',
}

export const ScheduleFormLayoutConstants = {
  layoutWithColumn: {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  },
  layoutWithoutColumn: {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  }
}