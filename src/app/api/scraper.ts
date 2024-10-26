"use server";

import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import post from 'axios';
import { JSDOM } from "jsdom";

import { Course, Class } from '../../lib/templates';

import departments from '../../../data/departments.json';
import releaseDates from '../../../data/releaseDates.json';

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
function parseCourses(html: string, term: string): Course[] {
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
      course = new Course(header.split(title)[0].trim().replace("\u00A0", "").replace("  ", " "), title);
      continue;
    }

    // class offered
    if (row.querySelector("tr[valign='top'] > td[nowrap='nowrap']")) {
      const cells = Array.from(row.querySelectorAll("td"))
      const data = cells.map(element => (element as Element).textContent as string);
      const bookstore = cells[15].querySelector("a")?.getAttribute("href") || null;
      const website = cells[16].querySelector("a")?.getAttribute("href") || null;
      course!.addClass(new Class(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13], data[14], bookstore, website, data[17], term, course!.id));
    }
    
    // comment either to the course or to the class specifically
    if (row.querySelector(".Comments"))
      if (course!.classes.length === 0) 
        course!.comment = row.querySelector(".Comments")!.textContent!.trim(); 
      else
        course!.classes[course!.classes.length - 1].comment = row.querySelector(".Comments")!.textContent!.trim();
  }
  courses.push(course);

  return courses as Course[];
}

// /**
//  * Scrapes all courses from the given department.
//  * 
//  * @param department the department code
//  * @returns an array of courses
//  */
// export async function scrapeDept(department: string): Promise<Course[]> {
//   const term = getTerm();
//   const response = await post(URL, { params: { ...searchParams, "YearTerm": term, "Dept": department } });
//   return parseCourses(response.data, term!);
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // testing
  console.log("here")
  res.status(200).json([]);
  return

  const term = getTerm();
  let courses: Course[] = [];
  for (const dept of departments) {
    const response = await post(URL, { params: { ...searchParams, "YearTerm": term, "Dept": dept } });
    courses = courses.concat(parseCourses(response.data, term!));
  }
  console.log(courses);
  return NextResponse.json(courses);
}