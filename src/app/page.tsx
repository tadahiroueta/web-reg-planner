"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { ClipboardIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

import { Class, Type, Status, DayOfWeek, Schedule, Course } from './lib/templates';

function ClassCodeLine({ klass }: { klass: Class }) {
  return (
    <div className="w-full inline-flex justify-between md:justify-start items-center md:gap-2">
      <p className="w-28 text-white">{ klass.courseId }</p>
      <p className="text-white">{ klass.code }</p>
      <ClipboardIcon className="w-5 h-5 text-white" />  
    </div>
  );
}

function ClassCodeSection({ classes, className }: { classes: Class[], className?: string }) {
  return (
    <div className={ "w-full flex flex-col rounded-2xl gap-4 px-3 py-4 bg-accent " + className }>
      <h2 className="font-medium text-xl text-white">Class codes</h2>
      <div className="w-full flex flex-col gap-2 pl-4">
        { Array.from({ length: (classes.length + 1) / 2 }).map((_, i) => (
          <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4">
            { classes.slice(i * 2, (i + 1) * 2).map((klass, i) => <ClassCodeLine klass={ klass } key={ i } />) }
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  // // TODO remove DEV shit
  // const string = fs.readFileSync("./src/data/sample.html", "utf-8");
  // const courses = parseCourses(string, "2024-92").slice(0, 7);

  // // classes that you are taking and the ones that you're not
  // let schedules: Schedule[] = [];
  // for (let i=0; i<4; i++) {
  //   const schedule = new Schedule();
  //   courses.slice(i * 4, (i + 1) * 4).forEach(course => schedule.addCourse(new ScheduleCourse(course.id, course.title, course.classes.find(klass => klass.type === Type.Lecture)!, course.classes.find(klass => klass.type !== Type.Lecture)!, course.comment)));
  //   schedules.push(schedule);
  // }

  let currentScheduleI = 0;

  // for search
  const [searchKey, setSearchKey] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [autocomplete, setAutocomplete] = useState<string[]>([]);
  const [autocompleteIndex, setAutocompleteIndex] = useState<number>(-1);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/scraper");
      console.log(await response.json());
      setAvailableCourses(await response.json());
    })();
  }, []);

  /**
   * Updates autocomplete functions and scrapes once a deptartment is selected.
   * @param event the change in the input 
   */
  function handleSearch(event: ChangeEvent<HTMLInputElement>): void {
    const searchValue = event.target.value.toUpperCase();
    setSearchKey(searchValue);
    setAutocomplete(availableCourses.filter((course) => course.id.includes(searchValue)).slice(0, 3).map((course) => course.id));
  }

  /**
   * Interacts with the autocomplete options
   * @param keyEvent 
   */
  function handleSearchKeyPressed(keyEvent: KeyboardEvent<HTMLInputElement>): void {
    // next autocomplete
    if (keyEvent.key === "ArrowDown" || keyEvent.key == "ArrowRight") {
      setAutocompleteIndex(autocompleteIndex === autocomplete.length - 1 ? -1 : (autocompleteIndex + 1));
      keyEvent.preventDefault();
      return;
    }

    // previous autocomplete
    if (keyEvent.key === "ArrowUp" || keyEvent.key == "ArrowLeft") {
      setAutocompleteIndex(autocompleteIndex === -1 ? autocomplete.length - 1 : (autocompleteIndex - 1));
      keyEvent.preventDefault();
      return;
    }

    // select autocomplete
    if (keyEvent.key === "Enter") {
      keyEvent.preventDefault();
      if (autocompleteIndex === -1) {
        const course = availableCourses.find((course) => course.id === searchKey);
        // invalid course
        if (!course) { return; }

        setCourses([...courses, course]);
      }
      else { setCourses([...courses, availableCourses.find((course) => course.id === autocomplete[autocompleteIndex])!]); }
      
      setSearchKey("");
      setAutocomplete([]);
    }
  }

  return (
    <div className='w-full min-h-screen bg-soft-dark-900 flex flex-col items-center'>
      <header className="w-full bg-soft-dark-700 px-5 py-16 md:py-10 flex flex-col gap-6 items-center">
        {/* inner head */}
        <div className="w-full md:w-[40rem] flex flex-col gap-6">
          <h1 className="w-full text-4xl md:text-5xl md:font-light text-center text-white">Web Reg Planner</h1>
          <p className="w-full tracking-tight md:tracking-normal text-center text-white">
            Welcome to UC Irvine's Web Reg Planner! This website lets you enter a list of classes you're interested in and quickly generates a bunch of schedule options, making sure none of your classes overlap. Instead of manually going through class times, you'll get a clean, visual display of possible weekly schedules, so you can pick the one that works best for you in no time.
            <br />
            <br />
            Created by an incoming freshman, this tool is designed to help fellow students easily organize their course schedules and streamline the registration process for a stress-free quarter.
          </p>
        </div>
      </header>
      <main className="w-full md:h-[44rem] flex flex-col md:flex-row items-center gap-10 md:gap-3 px-5 md:pl-16 md:pr-4 py-16">
        {/* left side */}
        <div className="w-full md:w-[30rem] md:h-full flex flex-col items-center justify-between md:pb-8">
          {/* course list input area */}
          <div className="w-full rounded-2xl flex flex-col gap-4 px-3 py-4 bg-soft-dark-500">
            <h2 className="font-medium text-xl text-white">Course list</h2>
            {/* input bar + autocomplete */}
            <div className="w-full h-14 flex flex-col divide-y divide-white z-10">
              {/* input bar */}
              <div className={ "w-full flex justify-between px-5 py-3 rounded-t-3xl bg-soft-dark-700 " + (!isSearching || !autocomplete.length ? "rounded-b-3xl" : "") }>
                <input type="text" placeholder="Type here..." value={ searchKey } onChange={ handleSearch } onKeyUp={ handleSearchKeyPressed } onFocus={ () => { setIsSearching(true); } } onBlur={ () => { setIsSearching(false); } } className='w-full outline-none bg-transparent text-white uppercase' />
                <button>
                  <PlusCircleIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              { isSearching && autocomplete.map((option, index) => <h4 key={ index } className={ 'w-full px-5 py-2 text-white ' + (index === autocomplete.length - 1 ? "rounded-b-3xl " : "") + (index === autocompleteIndex ? "bg-soft-dark-500" : "bg-soft-dark-700") }>{ option }</h4>) }
            </div>
            {/* list of courses */}
            <div className="w-full flex flex-col gap-3 md:gap-1 px-4 py-2">
              { courses.slice(0, 7).map((course, i) => {
                let secondaryClassText = course.secondaryClassType === Type.Lab ? "+ LAB" : course.secondaryClassType === Type.Discussion ? "+ DISCUSSION" : course.secondaryClassType === Type.Tutorial ? "+ TUTORIAL" : "";
                const status = course.getStatus();

                return (
                  // course line
                  <div key={ i } className="w-full flex flex-col">
                    {/* first line */}
                    <div className="w-full inline-flex gap-3 text-sm">
                      <p className="w-28 text-sm uppercase text-white">{ course.id }</p>
                      <p className="grow text-sm line-clamp-1 text-white">{ course.title }</p>
                      <p className="hidden md:inline text-sm line-clamp-1 text-white">{ secondaryClassText }</p>
                      { status === Status.Open ? <InformationCircleIcon className="w-6 h-6 text-white" />
                        : status === Status.Full ? <ExclamationCircleIcon className="w-6 h-6 text-red-500" /> 
                        : <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" /> }
                    </div>
                    {/* second line */}
                    <div className="flex md:hidden px-5">
                      <p className="text-sm text-white">{ secondaryClassText }</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ClassCodeSection classes={ schedules.length ? schedules[0].classes : [] } className='hidden md:flex' />
        </div>
        {/* right side */}
        <div className="w-full md:w-auto md:grow md:h-full flex flex-col items-center gap-4">
          {/* slider */}
          <div className="w-full md:grow flex items-center gap-3">
            <ChevronLeftIcon className='hidden md:block w-8 h-8 text-white stroke-2' />
              {/* calendar */}
              <div className="w-full h-[36rem] md:h-full rounded-2xl flex bg-soft-dark-700 divide-x">
                {/* time column */}
                <div className="w-7 h-full flex flex-col divide-y">
                  { Array.from({ length: 16}).map((_, i) => (
                    <div key={ i } className="w-full flex-1 flex flex-col items-center">
                      { i === 0 ? null : <p className="text-white text-xs transform scale-75">{ (i + 5) % 12 + 1 + (i < 5 ? "AM" : "PM") }</p> }
                    </div>
                  ))}
                </div>
                {/* days */}
                { Object.keys(DayOfWeek).map((dayName, dayNumber) => (
                  <div key={ dayNumber } className="flex-1 h-full flex flex-col divide-y">
                    <div className="w-full flex-1 flex items-center justify-center">
                      <p className="text-xs text-white">{ dayName }</p>
                    </div>
                    { Array.from({ length: 15 }).map((_, i) => {
                      const event = schedules[0]?.hours.get(Object.values(DayOfWeek)[dayNumber]+ "" + (i + 7));
                      const colorCode = event?.colorId! * 200 + 100;
                      const startMinute = event?.time?.start.minute;
                      const duration = !event ? 0 : event.time!.end.hour - event.time!.start.hour + (event.time!.end.minute - event.time!.start.minute) / 60;

                      return (
                        <div key={ i } className="relative w-full flex-1 border-t-1 border-white">
                          { event ? (
                            <div className={ "absolute top-" + (startMinute! >= 45 ? "3/4" : startMinute! >= 30 ? "1/2" : startMinute! >= 15 ? "1/4" : "0") + " w-full h-" + (duration >= 4 ? "4x" : duration >= 3 ? "3x" : duration >= 2 ? "2x" : duration >= 1.3 ? "4/3" : duration >= .83 ? "5/6" : "1/2") + " rounded-md z-10 p-0.5 bg-" + (event!.type === Type.Lecture ? "rainbow-" : "rainbow-dark-") + colorCode + " text-rainbow-light-" + colorCode }>
                              <h4 className="font-semibold text-xs tranform scale-90 uppercase line-clamp-1">{ event!.courseId }</h4>
                              <h4 className="font-semibold text-xs transform scale-90 uppercase line-clamp-1">{ event!.type }</h4>
                            </div>
                          ) : null }
                        </div>
                      );
                    })}
                  </div>
                )) }
              </div>
            <ChevronRightIcon className='hidden md:block w-8 h-8 text-white stroke-2' />
          </div>
          {/* dots underneath */}
          <div className="w-full flex justify-center gap-4">
            { schedules.map((_, i) => i === currentScheduleI ? (
              <div key={ i } className="w-3 h-3 rounded-full bg-white border-2 border-white" />
            ) : (
              <button key={ i } className='w-3 h-3 rounded-full border-2 border-white' />
            ))}
          </div>
        </div>
        {/* class code section - mobile */}
        <ClassCodeSection classes={ schedules[currentScheduleI] ? schedules[currentScheduleI].classes : [] } className='w-full md:hidden' />
      </main>
      <footer className="w-full flex flex-col md:flex-row-reverse items-center justify-center gap-5 px-10 pt-8 pb-16">
        <p className="w-full md:w-auto text-xs md:text-base font-light text-white">github.com/tadahiroueta/web-reg-planner</p>
        <div className="w-full md:w-auto flex flex-col items-end justify-center gap-2">
          <p className="text-xs md:text-base font-light text-white">dev by tadahiroueta</p>
          <p className="text-xs md:text-base font-light text-white">design by Sachchit Balamurugan</p>
        </div>
      </footer>
    </div>
  );
}
