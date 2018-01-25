### Semester

_id: ObjectId;
key: string; ex) 2018_spring, 2017_fall
displayName: ex) 2018 Spring, 2017 Fall
dates: [{
  _id: ObjectId
  startTime: date
  endTime: date
}]
location: string; ex) HEC 405
faculties: [Ref Faculty ObjectId]
created_at: date
updated_at: date

### Faculty

_id: ObjectId;
email: [string]
firstName: string;
lastName: string;
signup_at: date; // When the password is set
register_at: date; // When the admin adds the faculty
created_at: date
updated_at: date

### Schedule

_id: ObjectId
facultyId: Ref Faculty ObjectId
semesterId: Ref Semester ObjectId
availableTime: [{

}]
// Think later how to store faculty's available/unavailable time. Create another date model?
// Test how update child object work