### Semester

_id: ObjectId;
key: string; ex) 2018_spring, 2017_fall
displayName: ex) 2018 Spring, 2017 Fall
presentationDates: [{
  _id: ObjectId
  start: date
  end: date
}]
location: string; ex) HEC 405
faculties: [Ref Faculty ObjectId]
created_at: date
updated_at: date

### Faculty

_id: ObjectId;
email: [string];
password: string;
firstName: string;
lastName: string;
isAdmin: boolean;
signup_at: date; // When the password is set
register_at: date; // When the admin adds the faculty
created_at: date
updated_at: date

### AvailableSlot

_id: ObjectId
faculty: Ref Faculty ObjectId
semester: Ref Semester ObjectId
availableSlots: [{
  _id: ObjectId;
  start: date;
  end: date;
}]
created_at: date;
updated_at: date;

### Group

_id: ObjectId;
projectName: string;
semester: Ref Semester ObjectId
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
}]
sponsorName: string;
groupNumber: number;
adminFaculty: Ref Faculty ObjectId
created_at: date;
updated_at: date;

### Presentation

_id: ObjectId;
start: date;
end: date;
semester: Ref Semester ObjectId
group: Ref Group ObjectId
faculties: [Ref Faculty ObjectId]
midPresentationLink: string; // This should be available
committeeFormLink: string;   // This should be available
created_at: date;
updated_at: date'