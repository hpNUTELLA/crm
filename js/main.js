const elStudentTemplate = document.querySelector("#student-template");
const elStudentsWrapper = document.querySelector("#students-wrapper");

const MAX_MARK = 150;
const PASS_PERCENT = 40;
const MAX_PERCENT = 100;

const addZero = num => {
  return num < 10 ? "0" + num : num;
}

const calculateStudentMarkPercent = (studentMark) => {
  return (studentMark * MAX_PERCENT / MAX_MARK).toFixed(1)
}

const createStudentRow = student => {
  const {
    id,
    name,
    lastName,
    markedDate,
    mark: markjon
  } = student;

  const elStudentRow = elStudentTemplate.cloneNode(true).content;

  const elStudentId = elStudentRow.querySelector(".student-id")
  elStudentId.textContent = id;

  const elStudentFullName = elStudentRow.querySelector(".student-fullname")
  elStudentFullName.textContent = `${name} ${lastName}`;

  const elStudentMarkedDate = elStudentRow.querySelector(".student-marked-date")
  const studentMarkedDate = new Date(markedDate);
  elStudentMarkedDate.textContent = `${addZero(studentMarkedDate.getDate())}.${addZero(studentMarkedDate.getMonth() + 1)}.${studentMarkedDate.getFullYear()} ${addZero(studentMarkedDate.getHours())}:${addZero(studentMarkedDate.getMinutes())}`;

  const studentMarkPercent = calculateStudentMarkPercent(markjon);
  const elStudentMark = elStudentRow.querySelector(".student-mark");
  elStudentMark.textContent = `${studentMarkPercent}%`;

  const elStudentPassStatusBadge = elStudentRow.querySelector(".badge");
  const didStudentPass = studentMarkPercent >= PASS_PERCENT;
  elStudentPassStatusBadge.textContent = didStudentPass ? "Pass" : "Fail"
  elStudentPassStatusBadge.classList.add(didStudentPass ? "bg-success" : "bg-danger")

  const elDeleteBtn = elStudentRow.querySelector(".btn-outline-danger");
  elDeleteBtn.dataset.id = id;

  const elEditBtn = elStudentRow.querySelector(".btn-outline-secondary");
  elEditBtn.dataset.id = id;

  return elStudentRow;
}

const elCountWrapper = document.querySelector("#count-wrapper");

const renderStudents = (studentsArray = students) => {
  elStudentsWrapper.innerHTML = "";

  elCountWrapper.textContent = `Count: ${studentsArray.length}`;
  studentsArray.forEach(student => {
    const elStudentRow = createStudentRow(student);
    elStudentsWrapper.append(elStudentRow);
  });
}

renderStudents();

const elAddStudentForm = document.querySelector("#add-student-form");

elAddStudentForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const formElements = evt.target.elements;

  const nameInputValue = formElements.name.value.trim();
  const lastNameInputValue = formElements.lastname.value.trim();
  const markInputValue = +formElements.mark.value.trim();

  if (nameInputValue && lastNameInputValue && markInputValue > 0) {
    const addingStudent = {
      id: Math.floor(Math.random() * 1000),
      name: nameInputValue,
      lastName: lastNameInputValue,
      mark: markInputValue,
      markedDate: new Date().toISOString()
    }

    students.unshift(addingStudent);
    elCountWrapper.textContent = `Count: ${students.length}`;

    const elNewStudent = createStudentRow(addingStudent);
    elStudentsWrapper.prepend(elNewStudent);
    elAddStudentForm.reset();
  }
});

const elEditModal = new bootstrap.Modal("#edit-student-modal");
const elEditForm = document.querySelector("#edit-student-form");
const elEditName = elEditForm.querySelector("#edit-name");
const elEditLastName = elEditForm.querySelector("#edit-lastname");
const elEditMark = elEditForm.querySelector("#edit-mark");

elStudentsWrapper.addEventListener("click", (evt) => {
  if (evt.target.matches(".btn-outline-danger")) {
    const clickedBtnId = +evt.target.dataset.id;
    const clickedBtnIndex = students.findIndex((studentjon) => {
      return studentjon.id === clickedBtnId;
    });
    students.splice(clickedBtnIndex, 1)

    renderStudents();
  }

  if (evt.target.matches(".btn-outline-secondary")) {
    const clickedBtnId = +evt.target.dataset.id;
    const clickedBtnObj = students.find((student) => student.id === clickedBtnId);

    if (clickedBtnObj) {
      elEditName.value = clickedBtnObj.name || "";
      elEditLastName.value = clickedBtnObj.lastName || "";
      elEditMark.value = clickedBtnObj.mark || "";

      elEditForm.dataset.id = clickedBtnId;
    }
  }
});

elEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const submittingItemId = +evt.target.dataset.id;

  const nameValue = elEditName.value.trim();
  const lastnameValue = elEditLastName.value.trim();
  const markValue = +elEditMark.value;

  if (nameValue && lastnameValue && markValue > 0) {
    const submittingItemIndex = students.findIndex(student => student.id === submittingItemId);

    const submittingItemObj = {
      id: submittingItemId,
      name: nameValue,
      lastName: lastnameValue,
      mark: markValue,
      markedDate: new Date().toISOString()
    }

    students.splice(submittingItemIndex, 1, submittingItemObj);
    renderStudents();
    elEditModal.hide();
  }
})

const elFilterForm = document.querySelector("#filter");

// Filterning qo'lbola usuli
// const filter = (array, fn) => {
//   const filtredStudents = [];

//   array.forEach((element) => {
//     if (fn(element)) {
//       filtredStudents.push(element);
//     }
//   });

//   return filtredStudents;
// }

elFilterForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const elements = evt.target.elements;
  const searchValue = elements.search.value;
  const fromValue = +elements.from.value;
  const toValue = +elements.to.value;
  const sortValue = elements.sortby.value;

  const filtredStudents = students
    .filter(function (element) {
      const isNameMatches = element.name.toLowerCase().includes(searchValue.toLowerCase());
      const isLastNameMatchs = element.lastName.toLowerCase().includes(searchValue.toLowerCase())
      return isNameMatches || isLastNameMatchs
    })
    .filter(student => {
      const studentMarkPercent = +calculateStudentMarkPercent(student.mark);
      return studentMarkPercent >= fromValue;
    })
    .filter(student => {
      const studentMarkPercent = +calculateStudentMarkPercent(student.mark);
      return !toValue ? true : studentMarkPercent <= toValue;
    })
    .sort((a, b) => {
      switch (sortValue) {
        case "1":
          if (a.name > b.name) {
            return 1
          } else if (a.name === b.name) {
            return 0
          }
          return -1;
        case "2":
          return b.mark - a.mark;
        case "3":
          return a.mark - b.mark;
        case "4":
          return (new Date(b.markedDate).getTime()) - (new Date(a.markedDate).getTime())
        default:
          break;
      }

      return 0;
    });

  renderStudents(filtredStudents);
})