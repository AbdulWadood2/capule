// const {} = require("../");
const fs = require("fs");
module.exports = {
  addBookMarks(user, elements) {
    const { token, ...sanitizedUser } = user.toObject(); // 'toObject' converts Mongoose document to a plain
    const userBookMarkedMcqs = [];
    for (item of sanitizedUser.bookmark) {
      userBookMarkedMcqs.push(String(item.mcqId));
    }
    // console.log(userBookMarkedMcqs)
    let modifyForBookMark = [];
    for (item of elements) {
      if (userBookMarkedMcqs.includes(String(item._id))) {
        modifyForBookMark.push({ ...item, bookmark: true });
      } else {
        modifyForBookMark.push({ ...item, bookmark: false });
      }
    }
    return modifyForBookMark;
  },
  getRandomElementsFromArrayWithLimitation(arr, numElements) {
    const arrayCopy = [...arr]; // Create a copy of the original array to avoid modifying it

    return Array.from({ length: numElements }, () => {
      const randomIndex = Math.floor(Math.random() * arrayCopy.length);
      return arrayCopy.splice(randomIndex, 1)[0]; // Remove and retrieve the element
    });
  },
  async addSubjectNameAndMarks(randomElements, Subject) {
    const elementPromises = randomElements.map(async (item) => {
      const subject = await Subject.findById(item.subjectId);
      if (subject) {
        return {
          ...item._doc,
          subjectName: subject.title,
          marks: subject.perMcqMark,
        };
      } else {
        return { ...item._doc };
      }
    });

    return await Promise.all(elementPromises);
  },
  analyzeArray(arr) {
    const uniqueNames = {};

    arr.forEach((item) => {
      const name = item.subjectName;

      if (!uniqueNames[name]) {
        if (name) {
          uniqueNames[name] = {
            name: name,
            length: arr.filter((obj) => obj.subjectName === name).length,
            marks: item.marks,
          };
        }
      }
    });
    return Object.values(uniqueNames).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },
  calculateTotalMarks(subjects) {
    return subjects.reduce(
      (totalMarks, subject) => totalMarks + subject.length * subject.marks,
      0
    );
  },
  async deleteFile(path) {
    return new Promise((resolve) => {
      fs.unlink("./posts" + path, (err) => {
        if (err) {
          console.log(`no file exist with ${path} location`);
        }
        resolve(); // Resolve the promise after unlink completes
      });
    });
  },
  getExtensionOfFile(fileName) {
    let lastDotIndex = fileName.lastIndexOf(".");

    // Split the string into two parts based on the last dot
    let firstPart = fileName.substring(0, lastDotIndex);
    let secondPart = fileName.substring(lastDotIndex + 1);

    // Create an array with the two parts
    return secondPart;
  },
};
