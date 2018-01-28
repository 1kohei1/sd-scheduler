export default interface Group {
  _id: string;
  semester: string; // This property will not be populated on the server side
  members: [{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }];
  sponsors: [{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }];
  sponsorName: string;
  groupNumber: number;
  adminFaculty: string; // This property will not be populated on the server side (probably)
  created_at: Date;
  updated_at: Date;
}