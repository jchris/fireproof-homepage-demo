db = connect("fireproof");

function addItemDb(text) {
  db.put({
    text,
    done: false,
    created: Date.now()
  });
}

function addItem(e) {
  e.preventDefault();
  const input = document.querySelector("form input");
  if (!input.value) return;
  addItemDb(input.value);
  input.value = "";
}
window.addItem = addItem;

function toggleDone(doc) {
  doc.done = !doc.done;
  doc.updated = Date.now();
  db.put(doc);
}

async function redraw() {
  const result = await db.query("created", {
    includeDocs: true,
    descending: true,
    limit: 10
  });

  document.querySelector("ul").innerHTML = "";

  for (const row of result.rows) {
    const textSpan = document.createElement("span");
    textSpan.innerText = row.doc.text;

    const checkbox = document.createElement("input");
    checkbox.onchange = () => {
      toggleDone(row.doc);
    };
    if (row.doc.done) {
      checkbox.setAttribute("checked", true);
    }
    checkbox.setAttribute("type", "checkbox");

    const deleteSpan = document.createElement("span");
    deleteSpan.innerText = "x";
    deleteSpan.style = "text-align:right; color:#999";
    deleteSpan.onclick = function (e) {
      e.preventDefault();
      db.del(row.id);
      if (result.rows.length <= 1) reset();
    };

    const li = document.createElement("li");
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteSpan);

    document.querySelector("ul").appendChild(li);
  }
}

const fixtures = [
  "Merkle integrity",
  "Runs in any cloud",
  "End-to-end encryption",
  "JSON documents",
  "Open-source connectors",
  "Commodity storage",
  "Serverless architecture",
  "Immutable history",
  "Self-sovereign auth",
  "Cloudless operation",
  "Event-driven architecture",
  "React state management"
];

function getRandomThree(arr) {
  let result = ["Multi-writer CRDT"];
  let clonedArray = [...arr];

  for (let i = 1; i < 3; i++) {
    let randomIndex = Math.floor(Math.random() * clonedArray.length);
    result.push(clonedArray[randomIndex]);
    clonedArray.splice(randomIndex, 1);
  }

  return result;
}

async function reset(e) {
  if (e) e.preventDefault();
  const allDocs = await db.allDocs();
  for (const row of allDocs.rows) {
    db.del(row.key);
  }

  const puts = getRandomThree(fixtures).map((text) => {
    db.put({
      created: Date.now(),
      text,
      done: true
    });
  });
  await Promise.all(puts);

  db.compact();
}
window.reset = reset;

window.onload = function initialize() {
  db.subscribe(redraw);
  redraw();
  // reset() // remove when connected
};

function connect(name) {
  const db = Fireproof.fireproof(name + 7);
  // placeholder until Fireproof Cloud ships
  FireproofConnect.connect.partykitS3(
    db,
    "https://firehouse-chat.jchris.partykit.dev"
  );
  return db;
}

// for another app that syncs live with the same dataset see
// https://replit.com/@jchris5/HTML-CSS-JS-Auto-Refresh#script.js
