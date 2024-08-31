import post from 'axios';
import fs from "fs"
import { JSDOM } from 'jsdom';

import departments from '../data/departments.json';
import releaseDates from '../data/releaseDates.json';
import classProperties from '../data/classProperties.json';

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
 * 
 * @param html the web results for a department
 * @returns an array of courses
 */
function parseCourses(html: string): any {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // let courses: HTMLTableCellElement[] = Array.from(document.querySelectorAll(".CourseTitle"));
  // return courses.map((element) => (element.cellIndex + element.textContent));

  const courses = [];

  let rows = document.querySelectorAll("tr");
  var course = Object: {};
  for (const row of rows) {

    // new course
    if (row.querySelector(".CourseTitle")) {
      // save complete course
      if (Object.keys(course).length !== 0) courses.push(course);

      // start getting a new course
      const header = row.querySelector(".CourseTitle").textContent;
      const title = row.querySelector(".CourseTitle > font").textContent;
      course = { 
        id: header.split(title)[0].trim(),
        title, 
      };
      continue;
    }

    // class offered
    if (row.querySelector("tr[valign='top'] > td[nowrap='nowrap']")) {
      const data = Array.from(row.querySelectorAll("td"));
      for (let i = 0; i < data.length; i++) {
        course[classProperties[i]] = data[i].textContent
    }
  
  }
  return courses.map((course) => course.data + "\n");
}

async function scrape() {
  const term = getTerm();

  for (const department of departments) {
    const response = await post(URL, { params: { ...searchParams, "YearTerm": term, "Dept": department } });
  }
}

export default async function Home() {
  // scrape();
  // const { data } = await post(URL, { params: { ...searchParams, "YearTerm": getTerm(), "Dept": "I&C SCI" } });
  const string = fs.readFileSync("./src/data/sample.html", "utf-8");
  const courses = parseCourses(string);

  return (
    <main className='w-full h-screen p-8' style={{ whiteSpace: 'pre-line' }}>
      { courses }
    </main>
  );
}
