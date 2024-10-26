let Month = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
}

export enum Type {
  Lecture = 'Lec',
  Lab = 'Lab',
  Discussion = 'Dis',
  Tutorial = 'Tut'
}

enum Modality {
  Online = 'Online',
  InPerson = 'In-Person'
}

export enum DayOfWeek {
  Monday = 'M',
  Tuesday = 'Tu',
  Wednesday = 'W',
  Thursday = 'Th',
  Friday = 'F'
}

enum Restriction {
  PrerequisiteRequired = 'A',
  AuthorizationCodeRequired = 'B',
  FeeRequired = 'C',
  PassNotPassOptionOnly = 'D',
  FreshmenOnly = 'E',
  SophomoresOnly = 'F',
  LowerDivisionOnly = 'G',
  JuniorsOnly = 'H',
  SeniorsOnly = 'I',
  UpperDivisionOnly = 'J',
  GraduateOnly = 'K',
  MajorOnly = 'L',
  NonMajorOnly = 'M',
  SchoolMajorOnly = 'N',
  NonSchoolMajorOnly = 'O',
  BiomedicalPassFail = 'R',
  SatisfactoryUnsatisfactoryOnly = 'S',
  SeparateAuthorizationCodes = 'X'
}

export enum Status {
  Open = 'OPEN',
  Waitlist = 'Waitl',
  Full = 'FULL',
  NewOnly = 'NewOnly'
}

type Section = {
  letter: string | null;
  number: number | null;
}

type Units = {
  min: number;
  max: number;
}

type Time = {
  hour: number;
  minute: number;
}

type RecurringPeriod = {
  days: DayOfWeek[];
  start: Time;
  end: Time;
}

type ExactPeriod = {
  start: Date;
  end: Date;
}

type Enrolled = {
  current: number;
  max: number;
}

type Waitlist = {
  students: number | null;
  turnedOff: boolean;
}

export class Class {
  code: number;
  type: Type;
  section: Section;
  units: Units;
  instructor: string[];
  modality: Modality;
  time: RecurringPeriod | undefined;
  place: string | undefined | null; // undefined if TBA, null if online
  final: ExactPeriod | undefined | null; // undefined if TBA, null if no final
  maximum: number;
  enrolled: Enrolled;
  waitlist: Waitlist;
  requests: number;
  newOnlyReserved: number;
  restrictions: Restriction[];
  textbook: string | null;
  website: string | null;
  status: Status;
  comment: string | null = null;
  courseId: string;
  colorId: number | null = null;

  /** 
   * Initializes section from raw string
   * 
   * @param section raw string as given
   * @returns section object
   */
  getSection(section: string): Section {
    const letterFirst = isNaN(parseInt(section[0]));
    if (letterFirst) {
      return isNaN(parseInt(section[1])) ? {
        letter: section.slice(0, 2),
        number: parseInt(section.slice(2)) || null
      } :
      {
        letter: section[0],
        number: parseInt(section.slice(1)) || null
      }
    }
    else {
      return !isNaN(parseInt(section[1])) ? {
        letter: section.slice(2) || null,
        number: parseInt(section.slice(0, 2))
      } :
      {
        letter: section.slice(1) || null,
        number: parseInt(section[0])
      }
    }
  }

  /**
   * Initializes time from raw string
   * 
   * @param time raw string as given
   * @returns weekly recurring class period
   */
  getTime(time: string): RecurringPeriod | undefined {
    if (time.includes("TBA")) return undefined;
    
    let [ dayPart, timePart ] = time.split('\u00A0');
    dayPart = dayPart.trim();
    const days = [];
    for (let i = 0; i < dayPart.length; i++) {
      const letter = dayPart[i];
      days.push(letter === "T" ? (letter + dayPart[++i]) as DayOfWeek : letter as DayOfWeek);
    }
    let [ start, end ] = timePart.split('-');
    const [ startHour, startMinutes ] = start.trim().split(':');
    const [ endHour, endMinutes ] = end.trim().split(":");
    let pm: boolean = false;
    if (end.includes("p")) {
      pm = true;
      end = end.slice(0, -1);
    }
    return {
      days,
      start: {
        hour: parseInt(startHour) % 12 + (pm && parseInt(startHour) < 10 ? 12 : 0),
        minute: parseInt(startMinutes)
      },
      end: {
        hour: parseInt(endHour) % 12 + (pm ? 12 : 0),
        minute: parseInt(endMinutes)
      }
    };
  }

  /**
   * Initializes final from raw string and term
   * 
   * @param final raw string as given
   * @param term academic term
   * @returns exact date and time for final
   */
  getFinal(final: string, term: string): ExactPeriod | undefined | null {
    if (final.trim().length === 0) return null;
    if (final.includes("TBA")) return undefined;
    
    let [ _, monthPart, dayPart, timePart ] = final.split(' ');
    const year = parseInt(term.slice(-4));
    const month = Month[monthPart as keyof typeof Month];
    const day = parseInt(dayPart);
    const pm = timePart.includes('p');
    timePart = timePart.slice(0, -2);
    const [ start, end ] = timePart.split('-');
    let [ startHour, startMinutes ] = start.split(':');
    let [ endHour, endMinutes ] = end.split(':');
    return {
      start: new Date(year, month, day, parseInt(startHour) % 12 + (pm && parseInt(startHour) < 10 ? 12 : 0), parseInt(startMinutes)),
      end: new Date(year, month, day, parseInt(endHour) % 12 + (pm ? 12 : 0), parseInt(endMinutes))
    }
  }

  /**
   * @param code 
   * @param type 
   * @param section 
   * @param units 
   * @param instructor 
   * @param modality 
   * @param time 
   * @param place 
   * @param final 
   * @param maximum 
   * @param enrolled 
   * @param waitlist 
   * @param requests 
   * @param newOnlyReserved 
   * @param restrictions 
   * @param textbook 
   * @param website 
   * @param status 
   * @param term 
   * @param courseId
   */
  constructor(code: string, type: string, section: string, units: string, instructor: string, modality: string, time: string, place: string, final: string, maximum: string, enrolled: string, waitlist: string, requests: string, newOnlyReserved: string, restrictions: string, textbook: string | null, website: string | null, status: string, term: string, courseId: string) {
    this.code = parseInt(code);
    this.type = type as Type;
    this.section = this.getSection(section);
    this.units = {
      min: parseInt(units.split('-')[0]),
      max: parseInt(units.split('-')[1] || units.split('-')[0])
    };
    this.instructor = instructor.split('<br />'); // TODO fix later
    this.modality = modality as Modality;
    this.time = this.getTime(time);
    this.place = place.includes("TBA") ? undefined : place.includes("ON LINE") ? null : place;
    this.final = this.getFinal(final, term);
    this.maximum = parseInt(maximum);
    this.enrolled = {
      current: parseInt(enrolled.split('/')[0]),
      max: parseInt(enrolled.split('/')[1] || enrolled.split('/')[0])
    };
    this.waitlist = {
      students: parseInt(waitlist.includes("off") ? waitlist.slice(4, -1) : waitlist) || null,
      turnedOff: waitlist.includes("off")
    };
    this.requests = parseInt(requests);
    this.newOnlyReserved = parseInt(newOnlyReserved);
    this.restrictions = restrictions.replace(",", " ").split(' ').map((restriction) => restriction as Restriction).filter((restriction) => Object.values(Restriction).includes(restriction));
    this.textbook = textbook;
    this.website = website;
    this.status = status as Status;
    this.courseId = courseId;
  }

  /**
   * @param other 
   * @returns whether a lecture and a discussion/lab will match
   */
  matches(other: Class): boolean {
    return this.section.letter && other.section.letter ? this.section.letter === other.section.letter : true;
  }
}

export class Course {
  id: string;
  title: string;
  classes: Class[] = [];
  comment: string | null = null;
  secondaryClassType: Type | null = null;

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }

  /**
   * Adds a class to the course
   * 
   * @param klass 
   */
  addClass(klass: Class): void {
    this.classes.push(klass);
    if (klass.type === Type.Lecture) return;
    this.secondaryClassType = klass.type;
  }

  /**
   * @returns status of the course
   */
  getStatus(): Status {
    return this.classes.filter((klass) => klass.type === Type.Lecture).every((klass) => klass.status === Status.Full) || (this.secondaryClassType !== null && this.classes.filter((klass) => klass.type === this.secondaryClassType).every((klass) => klass.status === Status.Full)) ? Status.Full : this.classes.filter((klass) => klass.type === Type.Lecture).some((klass) => klass.status === Status.Open || klass.status === Status.NewOnly) && (this.secondaryClassType === null || this.classes.filter((klass) => klass.type === this.secondaryClassType).some((klass) => klass.status === Status.Open || klass.status === Status.NewOnly)) ? Status.Open : Status.Waitlist;
  }
}

export class ScheduleCourse extends Course {
  lecture: Class;
  secondaryClass: Class | null;

  constructor(id: string, title: string, lecture: Class, secondaryClass: Class | null = null, comment: string | null = null) {
    super(id, title);
    this.lecture = lecture;
    this.secondaryClass = secondaryClass;
    this.comment = comment;
  }
}

export class Schedule {
  courses: ScheduleCourse[] = [];
  classes: Class[] = [];
  hours = new Map<string, Class>();

  /**
   * Adds a course to the schedule
   * 
   * @param course 
   */
  addCourse(course: ScheduleCourse): void {
    this.courses.push(course);
    course.lecture.colorId = this.courses.length - 1;
    this.classes.push(course.lecture);
    course.lecture.time?.days.forEach((day) => this.hours.set(day + course.lecture.time!.start.hour, course.lecture));
    
    if (course.secondaryClass) {
      course.secondaryClass.colorId = this.courses.length - 1;
      this.classes.push(course.secondaryClass);
      course.secondaryClass.time?.days.forEach((day) => this.hours.set(day + course.secondaryClass!.time!.start.hour, course.secondaryClass!));
    }
  } 
}