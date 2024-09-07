import post from 'axios';
import fs from "fs"
import { JSDOM } from 'jsdom';

import { Course, Class } from './templates';
import departments from '../data/departments.json';
import releaseDates from '../data/releaseDates.json';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

const URL = "https://www.reg.uci.edu/perl/WebSoc";
const searchParams = {
  "ShowComments": "on",
  "ShowFinals": "on",
  "CancelledCourses": "Exclude",
  "Submit": "Display Web Results" // Text for dev, Web for prod
};


/**
 * @returns The upcoming academic term in UC Irvine's code format, according to the release dates.
 */
function getTerm(): string | undefined {
  const now = new Date();

  for (const [term, date] of Object.entries(releaseDates)) 
    if (now >= new Date(date)) return term;
}

/**
 * Extracts the courses from the HTML of a department's web results.
 * 
 * @param html the web results for a department
 * @param term the academic term
 * @returns an array of courses
 */
function parseCourses(html: string, term: string): any {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // let courses: HTMLTableCellElement[] = Array.from(document.querySelectorAll(".CourseTitle"));
  // return courses.map((element) => (element.cellIndex + element.textContent));

  const courses = [];

  const rows = Array.from(document.querySelectorAll("tr"));
  let course: Course | null = null;
  for (const row of rows) {

    // new course
    if (row.querySelector(".CourseTitle")) {
      // save complete course
      if (course !== null) courses.push(course);

      // start getting a new course
      const header: string = row.querySelector(".CourseTitle")!.textContent!;
      const title: string = row.querySelector(".CourseTitle > font")!.textContent!;
      course = { 
        id: header.split(title)[0].trim().replace("\u00A0", "").replace("  ", " "),
        title, 
        classes: [],
        comment: null
      };
      continue;
    }

    // class offered
    if (row.querySelector("tr[valign='top'] > td[nowrap='nowrap']")) {
      const cells = Array.from(row.querySelectorAll("td"))
      const data = cells.map(element => (element as Element).textContent as string);
      const bookstore = cells[15].querySelector("a")?.getAttribute("href") || null;
      const website = cells[16].querySelector("a")?.getAttribute("href") || null;
      course!.classes.push(new Class(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13], data[14], bookstore, website, data[17], term));
    }
    
    // comment either to the course or to the class specifically
    if (row.querySelector(".Comments"))
      if (course!.classes.length === 0) 
        course!.comment = row.querySelector(".Comments")!.textContent!.trim(); 
      else
        course!.classes[course!.classes.length - 1].comment = row.querySelector(".Comments")!.textContent!.trim();
  }
  courses.push(course);

  return courses.map((course) => course + "\n");
}

async function scrape() {
  const term = getTerm();

  for (const department of departments) {
    const response = await post(URL, { params: { ...searchParams, "YearTerm": term, "Dept": department } });
  }
}

function CourseLine({ data }: { data: Course }) {
  return (
    <div className="w-full flex flex-col">
      {/* first line */}
      <div className="w-full flex gap-4">
        <p className="w-28 text-white">{ data.id }</p>
      </div>
      {/* second line */}
    </div>
  );
}

export default async function Home() {
  let courses: Course[] = [
    { id: "I&C SCI 32", title: "PROG SOFTWARE LIBR", classes: [
      new Class("I&C SCI 32A", "PROG SOFTWARE LIBR", "LEC", "A", "MWF", "10:00-10:50", "CS 1800", "Pattis, Richard E.", "0", "0", "0", "0", "0", "0", "0", "https://uci.bncollege.com/shop/uci/page/find-textbooks", "https://www.ics.uci.edu/~pattis/ICS-32/", "0", "2021-2022 Fall")
    ], comment: null }
  ];

  return (
    <body className='w-full min-h-screen bg-soft-dark-900 flex flex-col items-center'>
      <head className="w-full bg-soft-dark-700 px-5 py-16 flex flex-col gap-6 items-center">
        {/* inner head */}
        <div className="w-full flex flex-col gap-6">
          <h1 className="w-full text-4xl text-center text-white">Web Reg Planner</h1>
          <p className="w-full tracking-tight text-center text-white">
            Welcome to UC Irvine's Web Reg Planner! This website lets you enter a list of classes you're interested in and quickly generates a bunch of schedule options, making sure none of your classes overlap. Instead of manually going through class times, you’ll get a clean, visual display of possible weekly schedules, so you can pick the one that works best for you in no time.
            <br />
            <br />
            Created by an incoming freshman, this tool is designed to help fellow students easily organize their course schedules and streamline the registration process for a stress-free quarter.
          </p>
        </div>
      </head>
      <main className="w-full flex flex-col items-center gap-10 px-5 py-16">
        {/* left side */}
        <div className="w-full flex flex-col items-center gap-16">
          {/* course list input area */}
          <div className="w-full rounded-2xl flex flex-col gap-4 px-3 py-4 bg-soft-dark-500">
            <h2 className="font-medium text-xl text-white">Course list</h2>
            {/* input bar */}
            <div className="w-full rounded-3xl flex justify-between px-5 py-3 bg-soft-dark-700">
              <input type="text" placeholder="Type here..." className='outline-none bg-transparent' />
              <button>
                <PlusCircleIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            {/* list of courses */}
            <div className="w-full flex flex-col gap-3 px-4 py-2">
              { courses.map((course, i) => <CourseLine data={ course } key={ i } />) }
            </div>
          </div>
        </div>
      </main>
    </body>
  );
}
