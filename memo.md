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
- [x] Email verification

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

- [x] Add faculties
- [x] Deactivate faculties
- [x] Register presentation dates
- [x] Register presentation location
- [x] Check schedule in the calendar view

TODO:

- [x] Add validation to the overview date and Availability Form
- [x] Update Date.tsx to handle date object
- [ ] Check why initial component layout is broken (v3)
- [x] Create a video to explain how to put available time
- [x] Make redirect to where user used to be after success login (Wait release of Next 5: https://zeit.co/blog/next-canary) (v3)
- [ ] Do not flash right action button when moving across the page. This happens because header component is remounted every time page changes (v3)
- [x] Update auth guard to better way (v3)
- [x] Display loading while data in overview is updating
- [x] Sort presentation dates when updated
- [ ] Let faculty enter the second, third emails to receive notification emails (v3)
- [x] Make email fancy
- [x] Think better redirect structure. (Currently redirect happens in custom-routes, Api.redirect, Api.makeRequest)
- [ ] Add validation for req.body using express-validator (https://github.com/ctavan/express-validator) (v3)
- [ ] Return error if specified resource does not exist (v3)
- [ ] Set up the mailing server and use queueing service to send emails (v4)
- [x] Log email fail/success
- [x] Use production ready session store (v3)
- [ ] Maybe MLab sandbox should not be enough for the project. Think other way to store session free
- [x] Find a way to read cookies from the server side since index constructor is executed on the server side
- [x] Use tab for calendar dates
- [ ] Research how to decrease the bundle size (probably no .map file)
- [x] Check if selected presentation time range is already taken by someone
- [x] Display selected presentation time in the calendar
- [ ] Support faculties to be displayed in EE/CS schedule (v3)
- [ ] Check sentences of no concecutive presentations in the calendar
- [ ] Improve the group import process. Thinking admin faculty gives me the group spreadsheet and I modify them to the format I specify. (v3)
- [ ] Admin faculties can send spreadsheet of groups from groups page
- [ ] Upload presentation materials (v2)

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

Import groups

The flow of importing groups is not optimized. Let's do simple minimum flow and update it step by step

1. Professor sends xlsx file to me (karai@knights.ucf.edu)
2. I modify these data and import them to the system
3. Admin faculty can see the list of groups, but they cannot modify
4. When they need to make change, they first have to let me know and I update them.

For step 4, it's trouble some for faculties, but making change to the group info should not happen often. So, current flow is OK based on this assumption.
If this assumption is wrong, change the flow accordingly.

### Concerns about multiple admin professors

What if the same presentation dates, but different locations?
With current implementation, 2 student group from different faculties can request presentations in a row. 

Solution: When faculty is reserved for the presentation, modify in scheduling page to make that faculty unavailable for the other presentation groups.