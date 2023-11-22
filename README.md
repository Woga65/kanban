# kanban

A JavaScript based ticket management system with full drag & drop support for desktop and mobile devices.
Recently I added a login system that I have programmed with JavaScript (custom HTML element), object oriented PHP and MySql/MariaDB.

## making of

I started this little project when I just got into JavaScript during a bootcamp when I was ahead of the exercises.
Some days later I contributed the so far written code to a group project where I was responsible for
the Kanban board (`https://github.com/DanielStoehr/join/commits/main`).

## initial goal

- finding out how Drag & Drop works on mobile touch devices
- getting my feet wet with ES6 modules and classes
- getting data from and writing data to a backend
- getting around some challenges regarding mobile Apple devices

## the backend

The backend that I have used has been supplied by Junus Ergin / Developer Akademie for educational purpose only.
There is no security layer implemented, therefore it is not intended for use in a production system.
(`https://github.com/JunusErgin/smallest_backend_ever`)

I've modified the original backend code to allow for a basic transaction processing and turned it
into an ES6 module.

A proper MySql backend will follow soon.

### amendment:
Recently I have modified the original backend to be accessible for logged in users only.

## this repository

contains the latest code of the Kanban board as a standalone project.
To have a look at the group project, refer to the link given above.

## dependencies

Vanilla JS, PHP 8.x, MySQL, no libraries, no frameworks.
A PHP enabled web server is needed for the login system and the backend.

## installation

- Change the line `setURL('https://your-domain.xyz/smallest_backend_ever');` in the file `js/backend.js` according to your needs
- Create a database with phpmyadmin or the tools provided by your hosting company
- Edit the file `includes/dbh.inc.php` (database credentials)
- Edit lines 8-11 in the file `classes/email-auth.class.php` (verification email)
- Edit lines 29, 34, 40 in the file `verify.php` (path to your index.html)
- If you want a guest account, sign up with `Username: Guest / Password: 123456` otherwise add `.guest-button { display: none; }` to the file `component/ws-login.css`
- Make any changes you like. For example you might want to take measures that the user chooses a strong password
- Upload the project files and folders to your PHP enabled web server

## customization / examples

I kept some example lines of code as comments in the file `js/main.js` for reference.

