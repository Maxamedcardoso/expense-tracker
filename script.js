// Qabso foomka, jadwalka iyo tirooyinka ku jira qaybta soo koobidda.
const expenseForm = document.querySelector("#add-expense form");
const expenseRows = document.querySelector("#transactions tbody");
const loadingStateRow = document.querySelector("#loading-expenses");
const emptyStateRow = document.querySelector("#empty-expenses");
const spentTotal = document.querySelector("#spent-total");
const monthlyBudget = document.querySelector("#monthly-budget");
const budgetRemaining = document.querySelector("#budget-remaining");
const categoryOptions = expenseForm.elements.category.options;
const initialSpentTotal = Number(spentTotal.value);
const expenses = window.expenseStorage.load();

// U diyaari hab lacagta loogu muujiyo doollar iyo laba jajab tobanle.
const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// U beddel qiimaha lacagta qaab taariikh akhris fudud leh.
function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// Samee badhamada caadiga ah ee safka: wax-ka-beddel iyo tirtirid.
function addActionButtons(row) {
  const oldActionsCell = row.querySelector(".expense-actions");
  const actionsCell = oldActionsCell || document.createElement("td");
  actionsCell.className = "expense-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "edit-expense";
  editButton.textContent = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-expense";
  deleteButton.textContent = "Delete";

  actionsCell.replaceChildren(editButton, deleteButton);
  if (!oldActionsCell) row.append(actionsCell);
}

// Ku rid hal input ama button unug cusub oo jadwalka ah.
function createCell(content) {
  const cell = document.createElement("td");
  cell.append(content);
  return cell;
}

// Ku sawir xogta kharashka safka, adigoo kaydinaya qiimayaal edit-ku isticmaalo.
function renderExpenseRow(row, expense) {
  row.dataset.id = expense.id;
  row.dataset.name = expense.name;
  row.dataset.category = expense.category;
  row.dataset.date = expense.date;
  row.dataset.amount = Number(expense.amount).toFixed(2);

  const nameCell = document.createElement("th");
  nameCell.scope = "row";
  nameCell.textContent = expense.name;

  const categoryCell = document.createElement("td");
  const categoryBadge = document.createElement("span");
  categoryBadge.className = "category-badge";
  categoryBadge.dataset.category = expense.category;
  categoryBadge.textContent = [...categoryOptions].find(
    (option) => option.value === expense.category,
  ).textContent;
  categoryCell.append(categoryBadge);

  const dateCell = document.createElement("td");
  const dateElement = document.createElement("time");
  dateElement.dateTime = expense.date;
  dateElement.textContent = formatDate(expense.date);
  dateCell.append(dateElement);

  const amountCell = document.createElement("td");
  const amountElement = document.createElement("data");
  amountElement.value = row.dataset.amount;
  amountElement.textContent = moneyFormat.format(Number(expense.amount));
  amountCell.append(amountElement);

  row.replaceChildren(nameCell, categoryCell, dateCell, amountCell);
  addActionButtons(row);
}

// Cusboonaysii wadarta kharashka iyo miisaaniyadda hadhay.
function updateTotals(newTotal) {
  const remaining = Number(monthlyBudget.value) - newTotal;
  spentTotal.value = newTotal.toFixed(2);
  spentTotal.textContent = moneyFormat.format(newTotal);
  budgetRemaining.value = remaining.toFixed(2);
  budgetRemaining.textContent = moneyFormat.format(remaining);
}

// Isku gee wadartii hore iyo kharashyada cusub ee la kaydiyey.
function calculateSpentTotal() {
  return (
    initialSpentTotal +
    expenses.reduce((total, expense) => total + Number(expense.amount), 0)
  );
}

// Samee aqoonsi gaar ah si edit/delete u helaan kharashka saxda ah.
function createExpenseId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

// Soo celi kharashyada kaydsan marka boggu furmo.
function restoreExpenses() {
  loadingStateRow.hidden = true;
  expenseForm.querySelector("button[type='submit']").disabled = false;

  if (expenses.length === 0) {
    emptyStateRow.hidden = false;
    return;
  }

  emptyStateRow.hidden = true;
  expenses.forEach((expense) => {
    const row = document.createElement("tr");
    renderExpenseRow(row, expense);
    expenseRows.append(row);
  });
  updateTotals(calculateSpentTotal());
}

// Tus loading kooban si app-ku u ekaado inuu xogta soo rarayo.
loadingStateRow.hidden = false;
emptyStateRow.hidden = true;
expenseForm.querySelector("button[type='submit']").disabled = true;
window.setTimeout(restoreExpenses, 700);

// Marka foomka la diro, ku dar kharashka jadwalka oo cusboonaysii wadarta.
expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Ka akhri xogta meelaha foomka ku jira.
  const formData = new FormData(expenseForm);
  const name = formData.get("expense").trim();
  const amount = Number(formData.get("amount"));
  const category = formData.get("category");
  const date = formData.get("date");
  const expense = { id: createExpenseId(), name, amount, category, date };

  // Samee saf cusub, xogtana geli qoraal ahaan si ammaan ah.
  const row = document.createElement("tr");
  renderExpenseRow(row, expense);
  emptyStateRow.hidden = true;
  expenseRows.prepend(row);
  expenses.unshift(expense);
  window.expenseStorage.save(expenses);

  // Ku dar kharashka cusub wadarta, dabadeed xisaabi inta miisaaniyadda ka hadhay.
  updateTotals(calculateSpentTotal());

  // Nadiifi meelihii foomka si kharash kale loo gelin karo.
  expenseForm.reset();
});

// Hal dhageyste ayaa qabta badhamada dhammaan safafka, kuwa cusubna ku jiraan.
expenseRows.addEventListener("click", (event) => {
  const clickedButton = event.target.closest("button");
  if (!clickedButton) return;

  const row = clickedButton.closest("tr");
  const actionCell = clickedButton.closest("td");

  // Tirtiriddu waxay marka hore muujisaa laba doorasho si looga hortago khalad.
  if (clickedButton.classList.contains("delete-expense")) {
    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "confirm-delete";
    confirmButton.textContent = "Confirm delete";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-row-action";
    cancelButton.textContent = "Cancel";

    actionCell.replaceChildren(confirmButton, cancelButton);
    return;
  }

  // Marka tirtiridda la xaqiijiyo, safka ka saar jadwalka oo sax wadarta.
  if (clickedButton.classList.contains("confirm-delete")) {
    row.remove();
    const expenseIndex = expenses.findIndex(
      (expense) => expense.id === row.dataset.id,
    );
    if (expenseIndex !== -1) expenses.splice(expenseIndex, 1);
    window.expenseStorage.save(expenses);
    updateTotals(calculateSpentTotal());
    if (!expenseRows.querySelector("tr[data-amount]")) {
      emptyStateRow.hidden = false;
    }
    return;
  }

  // Cancel tirtiridda oo ku celi badhamadii caadiga ahaa.
  if (clickedButton.classList.contains("cancel-row-action")) {
    addActionButtons(row);
    return;
  }

  // Edit-ku wuxuu safka u beddelaa meelo xogta lagu saxayo.
  if (clickedButton.classList.contains("edit-expense")) {
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = row.dataset.name;
    nameInput.setAttribute("aria-label", "Expense name");
    nameInput.required = true;

    const categorySelect = document.createElement("select");
    categorySelect.setAttribute("aria-label", "Expense category");
    [...categoryOptions]
      .filter((option) => option.value)
      .forEach((option) => categorySelect.append(option.cloneNode(true)));
    categorySelect.value = row.dataset.category;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = row.dataset.date;
    dateInput.setAttribute("aria-label", "Expense date");
    dateInput.required = true;

    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.min = "0.01";
    amountInput.step = "0.01";
    amountInput.value = row.dataset.amount;
    amountInput.setAttribute("aria-label", "Expense amount");
    amountInput.required = true;

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "save-edit";
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-edit";
    cancelButton.textContent = "Cancel";

    const actionsCell = document.createElement("td");
    actionsCell.className = "expense-actions";
    actionsCell.append(saveButton, cancelButton);
    row.replaceChildren(
      createCell(nameInput),
      createCell(categorySelect),
      createCell(dateInput),
      createCell(amountInput),
      actionsCell,
    );
    nameInput.focus();
    return;
  }

  // Cancel edit-ku wuxuu xogtii hore dib ugu sawiraa safka.
  if (clickedButton.classList.contains("cancel-edit")) {
    renderExpenseRow(row, row.dataset);
    return;
  }

  // Kaydi xogta cusub oo wadarta ku sax farqiga lacagta hore iyo tan cusub.
  if (clickedButton.classList.contains("save-edit")) {
    const [nameInput, categorySelect, dateInput, amountInput] =
      row.querySelectorAll("input, select");
    const newAmount = Number(amountInput.value);

    if (
      !nameInput.value.trim() ||
      !categorySelect.value ||
      !dateInput.value ||
      !amountInput.checkValidity() ||
      !Number.isFinite(newAmount)
    ) {
      const errorMessage = document.createElement("small");
      errorMessage.setAttribute("role", "alert");
      errorMessage.textContent = "Buuxi meelaha oo geli lacag ka weyn eber.";
      actionCell.append(errorMessage);
      return;
    }

    renderExpenseRow(row, {
      id: row.dataset.id,
      name: nameInput.value.trim(),
      category: categorySelect.value,
      date: dateInput.value,
      amount: newAmount,
    });
    const expenseIndex = expenses.findIndex(
      (expense) => expense.id === row.dataset.id,
    );
    if (expenseIndex !== -1) {
      expenses[expenseIndex] = {
        id: row.dataset.id,
        name: nameInput.value.trim(),
        category: categorySelect.value,
        date: dateInput.value,
        amount: newAmount,
      };
    }
    window.expenseStorage.save(expenses);
    updateTotals(calculateSpentTotal());
  }
});
