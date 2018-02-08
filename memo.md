### General workflow

1. Professor submit availability
2. Student determines what time and whom they do presentation
3. System saves and sends notification email to student groups and professors

### Features

System: 

- [ ] Send notification email when new group books faculties' time
- [ ] Send notification email when faculties become unavailable for booked time
- [ ] Send notification email when student gruop updates the presentation time
- [ ] Send notification email when student group deletes the presentation time
- [ ] Send notification email when senior design date is updated
- [ ] Send reminder email a day before and an hour before the presentation time
- [ ] Send signed PDF to senior design admin faculties when the presentation booking is made (v2)
- [ ] Email verification

Faculties:

- [x] Submit the schedule
- [x] Update the schedule
- [x] Check the bookings in the calendar view
- [ ] Upload signature (v2)

Students:

- [ ] Add sponsor email, other member's email when creating a booking
- [ ] Make the presentation booking
- [ ] Update the presentation booking
- [ ] Delete the presentation booking

Admin:

- [ ] Add faculties
- [ ] Deactivate faculties
- [x] Register presentation dates
- [x] Register presentation location
- [x] Check schedule in the calendar view

TODO:

- [x] Add validation to the overview date and Availability Form
- [ ] Use higher order component for Date, Locations, and Faculties component (v3)
- [ ] Explore what is the best word for registered/available faculties
- [x] Update Date.tsx to handle date object
- [ ] Check why initial component layout is broken (v3)
- [ ] Create a video to explain how to put available time
- [ ] Make redirect to where user used to be after success login (Wait release of Next 5: https://zeit.co/blog/next-canary) (v3)
- [ ] Remove .env devendencies by adding babel configuration. Resource: https://github.com/zeit/next.js/tree/canary/examples/with-dotenv (v3)
- [ ] Do not flash right action button when moving across the page. This happens because header component is remounted every time page changes (v3)
- [ ] Update auth guard to better way (v3)
- [x] Display loading while data in overview is updating
- [x] Sort presentation dates when updated
- [ ] Let faculty enter the second, third emails to receive emails

NOTES:

* Date displayed in the browser is in US Eastern time. This is because this project is developed for UCF.
* async/await is currently used in the client side only. This is new and I would like to get used to first.

How auth guard works in this project:

1. API route guard => Express middle ware
2. Frontend landing to auth protected page => front/custom-routes.ts
3. Frontend navigating to auth protected page => page's getInitialProps

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

