### General workflow

1. Professor submit availability
2. Student determines what time and whom they do presentation
3. System saves and sends notification email to student groups and professors

### Features

System: 

- [x] Send notification email when new group books faculties' time
- [x] Send notification email when faculties become unavailable for booked time
- [x] Send notification email when student gruop updates the presentation time
- [x] Send notification email when senior design date is updated
- [x] Send reminder email a day before and an hour before the presentation time
- [x] Email verification

Faculties:

- [x] Submit the schedule
- [x] Update the schedule
- [x] Check the bookings in the calendar view

Students:

- [x] Add sponsor email, other member's email when creating a booking
- [x] Make the presentation booking
- [x] Update the presentation booking

Admin:

- [x] Add faculties
- [x] Deactivate faculties
- [x] Register presentation dates
- [x] Register presentation location
- [x] Check schedule in the calendar view

System Admin:

- [x] Turn the faculty to admin (create PresentationDate and Location)
- [x] Turn off the faculty not to admin (Delete PresentationDate and Location)

TOP TODO:
- [ ] Research where is a good deployment platform. Must have:
  * Request analysis tool
  * Dockernize deployment
  * Available to use next
  * On demand price plan
- [ ] Solve mongodb connection issue

TODO:

- [x] Add validation to the overview date and Availability Form
- [x] Update Date.tsx to handle date object
- [ ] Check why initial component layout is broken (v3)
- [x] Create a video to explain how to put available time
- [x] Make redirect to where user used to be after success login (Wait release of Next 5: https://zeit.co/blog/next-canary) (v3)
- [ ] Do not flash right action button when moving across the page. This happens because header component is remounted every time page changes (v3) (Use Next custom app component: https://github.com/zeit/next.js#custom-app)
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
- [ ] Maybe MLab sandbox is not enough for the project. Think other way to store session free
- [x] Find a way to read cookies from the server side since index constructor is executed on the server side
- [x] Use tab for calendar dates
- [ ] Research how to decrease the bundle size (probably no .map file)
- [x] Check if selected presentation time range is already taken by someone
- [x] Display selected presentation time in the calendar
- [ ] Support faculties to be displayed in EE/CS schedule (v3)
- [ ] Upload presentation materials (v2)
- [ ] Add validation to object id existence (Middleware for that: https://github.com/CampbellSoftwareSolutions/mongoose-id-validator) (v3)
- [x] Display scheduled presentations
- [x] Test thoroughly about presentation validation
- [x] Fix the bug of asPath not generated in the redirect
- [ ] Refactor db.util to return the promise (currently some function requires calling `.exec`, and some are not)
- [x] Test presentation 1 hour reminder API
- [ ] Export presentation to the scheduling app faculty uses
- [x] Instead of just changing isAdmin status, update them to change isSystemAdmin and isTestUser flag
- [ ] After successful presentation schedule, present dialog and navigate user to calendar page
- [x] Let students pick what date to schedule like picking SD 2 faculties
- [ ] Send cancel email when group updates the presentation to different faculties
- [ ] Create error response model and make it clear how the error reponse looks like (Need to handle network problem as well)
- [ ] Add test (v2)
- [ ] Replace the GET requests to Graph QL to decrease the server load
- [ ] Update the dashboard to work when switching between the semesters
- [x] Create a presentationDate for isAdmin faculties when the semester is created. 

Feature requests from Dr. Heinrich

- [x] Email tab to send emails to faculties. (Make <LINK></LINK>to paste the link)
- [x] Faculties tab to register/delete faculties to the system
- [x] Group import file is gonna be [First name] [Last name] [Email] [Group number]
- [x] Let SD2 faculty manually schedule the presentation
- [x] Let student choose the faculty who is not registered to the system at scheduling presentation. 
- [x] Make presentation dates and location in one tab. The location can change by presentation dates chunk
- [ ] Reminding feature for student groups to provide conference paper
- [x] Instead of let user click, send code and make user type the code
- [x] Redesign the schedule page
- [ ] Navigate user to /schedule if the token is expired
- [x] Instead of showing user email to the public, let user enter the email and verify it's correct, then send verification code
- [x] Create nice landing page
- [x] Update schedule page for UI tweak

Check with Dr. Heinrich

- [ ] I heard outside faculty member should be only one person. Should I limit the outside faculty member to be only one person? Or leave it open for the case that group wants to invite other faculty to the presentation.
- [ ] I currently pay $15.00/month. Can the school support me?
- [ ] What if faculty itself is a sponsor and committee member? Pick them from both EECS available committee and add them to sponsor

Personal review:

GOOD: 

- Good structure of the API side
- Utilize mongoose hook for validations/sending emails
- Centralized place for API/DB interactions
- Keeping track of features in memo.md
- Thought thoroughly at the beginning about the DB structure
- Good choice of frontend framework

What I can do better:

- Better folder structure for the frontend component and component names
- Provide a consistent design when API returns error
- Be consistent for some terms. I use "subject" for adminemail view and "title" for the backend. 

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

Publishing features?
SD 2 faculty has to enter the dates and location. They have to make sure before asking students to schedule their presentations.

### Concerns about multiple admin professors

What if the same presentation dates, but different locations?
With current implementation, 2 student group from different faculties can request presentations in a row. 

Solution: When faculty is reserved for the presentation, modify in scheduling page to make that faculty unavailable for the other presentation groups.

### Questions

What scheduling app does faculty use? The app must have export feature to export the event.