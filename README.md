# kanban

A JavaScript based ticket management system with full drag & drop support for desktop and mobile devices

## making of

I started this little project when I just got into JavaScript during a bootcamp when I was ahead of the exercises.
Some days later I contributed the so far written code to a group project where I was responsible for
the Kanban board (`https://github.com/DanielStoehr/join/commits/main`).

## initial goal

- finding out how Drag & Drop works on mobile touch devices
- getting my feet wet with ES6 modules
- getting data from and writing data to a backend
- getting around some challenges regarding mobile Apple devices

## the backend

The backend that I have used has been supplied by Junus Ergin / Developer Akademie for educational purpose only.
There is no security layer implemented, therefore it is not intended for use in a production system.
(`https://github.com/JunusErgin/smallest_backend_ever`)

I've modified the original backend code to allow for a basic transaction processing and turned it
into an ES6 module.

## this repository

contains the latest code of the Kanban board as a standalone project.
To have a look at the group project, refer to the link given above.

## dependencies

Vanilla JS, no libraries, no frameworks
A PHP enabled web server is needed for the backend

## installation

Change the line 

`setURL('https://your-domain.xyz/smallest_backend_ever');` in the file `js/main.js` 

according to your needs then, just copy the project's files / folders to your web server.

## customization / examples

I kept some example lines of code as comments in the file `js/main.js` for reference.

