/*************************************************
 * 1. FIREBASE IMPORTS
 *************************************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/*************************************************
 * 2. FIREBASE CONFIG & INIT
 *************************************************/
const firebaseConfig = {
  apiKey: "AIzaSyAE-mYa_FUcSRL0ncwpXNMHsOZkJH6iEMI",
  authDomain: "class-cat-portal.firebaseapp.com",
  projectId: "class-cat-portal",
  storageBucket: "class-cat-portal.firebasestorage.app",
  messagingSenderId: "428746578480",
  appId: "1:428746578480:web:2df2fcb0beeb51c33bebf5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsRef = collection(db, "students");

/*************************************************
 * 3. GLOBAL STATE
 *************************************************/
let role = "student";

/*************************************************
 * 4. UI ROLE SELECTION
 *************************************************/
window.setRole = function (r) {
  role = r;

  document.getElementById("btn-std").style.background =
    r === "student" ? "var(--neon-cyan)" : "transparent";
  document.getElementById("btn-adm").style.background =
    r === "admin" ? "var(--neon-cyan)" : "transparent";

  document.getElementById("btn-std").style.color =
    r === "student" ? "black" : "var(--neon-cyan)";
  document.getElementById("btn-adm").style.color =
    r === "admin" ? "black" : "var(--neon-cyan)";
};

/*************************************************
 * 5. LOGIN LOGIC
 *************************************************/
window.attemptLogin = async function () {
  const id = document.getElementById("user-id").value;
  const pass = document.getElementById("user-pass").value;

  if (role === "admin") {
    if (id === "ADMIN" && pass === "REP2026") {
      showAdmin();
    } else {
      alert("Unauthorized Admin access!");
    }
    return;
  }

  // Student login (Firebase)
  const snapshot = await getDocs(studentsRef);
  let found = null;

  snapshot.forEach(docSnap => {
    const s = docSnap.data();
    if (s.id === id && s.password === pass) {
      found = s;
    }
  });

  if (found) {
    showStudent(found);
  } else {
    alert("Invalid Student Credentials");
  }
};

/*************************************************
 * 6. ADMIN ACTIONS
 *************************************************/
window.registerStudent = async function () {
  const id = document.getElementById("reg-id").value;
  const name = document.getElementById("reg-name").value;

  if (!id || !name) {
    alert("Missing info");
    return;
  }

  const password = Math.random().toString(36).slice(-6).toUpperCase();

  await addDoc(studentsRef, {
    id,
    name,
    password,
    score: "--"
  });

  document.getElementById("reg-id").value = "";
  document.getElementById("reg-name").value = "";

  loadStudents();
  alert("Student registered");
};

window.updateScore = async function () {
  const id = document.getElementById("score-id").value;
  const score = document.getElementById("score-val").value;

  const snapshot = await getDocs(studentsRef);

  snapshot.forEach(async docSnap => {
    if (docSnap.data().id === id) {
      await updateDoc(doc(db, "students", docSnap.id), { score });
      alert("Score updated");
      loadStudents();
    }
  });
};

/*************************************************
 * 7. DATA RENDERING
 *************************************************/
async function loadStudents() {
  const snapshot = await getDocs(studentsRef);
  const tbody = document.getElementById("student-table-body");
  tbody.innerHTML = "";

  let count = 0;

  snapshot.forEach(docSnap => {
    const s = docSnap.data();
    count++;

    tbody.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.id}</td>
        <td style="color:var(--neon-cyan)">${s.password}</td>
        <td>${s.score}</td>
      </tr>
    `;
  });

  document.getElementById("total-count").innerText =
    `Total Students: ${count}`;
}

/*************************************************
 * 8. SCREEN CONTROLS
 *************************************************/
function showAdmin() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("admin-dash").classList.remove("hidden");
  loadStudents();
}

function showStudent(data) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("student-dash").classList.remove("hidden");

  document.getElementById("display-name").innerText = data.name;
  document.getElementById("display-id").innerText = `ID: ${data.id}`;
  document.getElementById("display-score").innerText = data.score;
}

/*************************************************
 * 9. INITIAL STATE
 *************************************************/
setRole("student");
