import post from 'axios';
import fs from "fs"
import { JSDOM } from 'jsdom';

import { Course, Class } from './templates';
import departments from '../data/departments.json';
import releaseDates from '../data/releaseDates.json';

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

export default async function Home() {
  // scrape();
  // const { data } = await post(URL, { params: { ...searchParams, "YearTerm": getTerm(), "Dept": "I&C SCI" } });
  const string = fs.readFileSync("./src/data/sample.html", "utf-8");
  const term = getTerm()!;
  const courses = parseCourses(string, term);

  return (
    <main className='w-full h-screen p-8' style={{ whiteSpace: 'pre-line' }}>
      { courses }
    </main>
  );
}
