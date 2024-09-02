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

enum Type {
  Lecture = 'Lec',
  Lab = 'Lab',
  Discussion = 'Dis',
  Tutorial = 'Tut'
}

enum Modality {
  Online = 'Online',
  InPerson = 'In-Person'
}

enum DayOfWeek {
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

enum Status {
  Open = 'OPEN',
  Waitlist = 'Waitl',
  Full = 'FULL',
  NewOnly = 'NewOnly'
}

type Section = {
  letter: string;
  number: number;
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

type Course = {
  classes: Class[];
  comment: string;
}

class Class {
  code: number;
  type: Type;
  section: Section;
  units: Units;
  instructor: string[];
  modality: Modality;
  time: RecurringPeriod;
  place: string;
  final: ExactPeriod;
  maximum: number;
  enrolled: Enrolled;
  waitlist: Waitlist;
  requests: number;
  newOnlyReserved: number;
  restrictions: Restriction[];
  textbook: string;
  website: string;
  status: Status;

  /**
   * Initializes time from raw string
   * 
   * @param time raw string as given
   * @returns weekly recurring class period
   */
  getTime(time: string): RecurringPeriod {
    let [ dayPart, timePart ] = time.split('&nbsp;');
    dayPart = dayPart.trim();
    const days = [];
    for (let i = 0; i < dayPart.length; i++) {
      const letter = dayPart[i];
      days.push(letter === "T" ? DayOfWeek[letter + dayPart[++i] as keyof typeof DayOfWeek] : DayOfWeek[letter as keyof typeof DayOfWeek]);
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
        hour: parseInt(startHour) + (pm ? 12 : 0),
        minute: parseInt(startMinutes)
      },
      end: {
        hour: parseInt(endHour) + (pm ? 12 : 0),
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
  getFinal(final: string, term: string): ExactPeriod {
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
      start: new Date(year, month, day, parseInt(startHour) + (pm ? 12 : 0), parseInt(startMinutes)),
      end: new Date(year, month, day, parseInt(endHour) + (pm ? 12 : 0), parseInt(endMinutes))
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
   */
  constructor(code: string, type: string, section: string, units: string, instructor: string, modality: string, time: string, place: string, final: string, maximum: string, enrolled: string, waitlist: string, requests: string, newOnlyReserved: string, restrictions: string, textbook: string, website: string, status: string, term: string) {
    this.code = parseInt(code);
    this.type = Type[type as keyof typeof Type];
    this.section = {
      letter: section[0],
      number: parseInt(section.slice(1))
    };
    this.units = {
      min: parseInt(units.split('-')[0]),
      max: parseInt(units.split('-')[1] || units.split('-')[0])
    };
    this.instructor = instructor.split('<br />'); // TODO fix later
    this.modality = Modality[modality as keyof typeof Modality];
    this.time = this.getTime(time);
    this.place = place;
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
    this.restrictions = restrictions.split('').map((restriction) => Restriction[restriction as keyof typeof Restriction] || null).filter((restriction) => restriction !== null);
    this.textbook = textbook;
    this.website = website;
    this.status = Status[status as keyof typeof Status];
  }
}