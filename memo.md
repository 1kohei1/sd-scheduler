### General workflow

1. Professor submit availability
2. Student determines what time and whom they do presentation
3. System saves and sends notification email to student groups and professors

### Features

System: 

- [ ] Login with outlook [passport-outlook](https://www.npmjs.com/package/passport-outlook)
- [ ] Send notification email when new group books faculties' time
- [ ] Send notification email when faculties become unavailable for booked time
- [ ] Send notification email when student gruop updates the presentation time
- [ ] Send notification email when student group deletes the presentation time
- [ ] Send notification email when senior design date is updated
- [ ] Send reminder email a day before and an hour before the presentation time
- [ ] Send signed PDF to senior design admin faculties when the presentation booking is made (v2)
- [ ] Cash retrieved data on the client side

Faculties:

- [ ] Submit the schedule
- [ ] Update the schedule
- [ ] Check the bookings in the calendar view
- [ ] Upload signature (v2)

Students:

- [ ] Add sponsor email, other member's email when creating a booking
- [ ] Make the presentation booking
- [ ] Update the presentation booking
- [ ] Delete the presentation booking

Admin:

- [ ] Add faculties
- [ ] Deactivate faculties
- [ ] Register presentation dates
- [ ] Register presentation location
- [ ] Check schedule in the calendar view

TODO:

- [ ] Add validation to the overview date
- [ ] Use higher order component for Date, Locations, and Faculties component (Low priority)
- [ ] Explore what is the best word for registered/available faculties
- [x] Update Date.tsx to handle date object
- [ ] Change Semester.tsx to store semester's presentation date in Date Object
- [ ] Check why initial component layout is broken
- [ ] Make availability editable by text. Auto refresh on calendar. Date is at the header and input will look like the date input in overview

NOTES:

* Date displayed in the browser is in US Eastern time. This is because this project is developed for UCF.

### Flows

Update presentation:

1. Students make change to the presentation
2. Students enter one of the email in the studentsEmail
3. System sends verification email
4. Student clicks the link and change is made. 

Delete presentation:

1. Student click delete button
2. Student enter one of the group member's email
3. System sends email and confirm the action