// Qabso foomka, jadwalka iyo tirooyinka ku jira qaybta soo koobidda.
const expenseForm = document.querySelector("#add-expense form");
const expenseRows = document.querySelector("#transactions tbody");
const spentTotal = document.querySelector("#spent-total");
const monthlyBudget = document.querySelector("#monthly-budget");
const budgetRemaining = document.querySelector("#budget-remaining");

// U diyaari hab lacagta loogu muujiyo doollar iyo laba jajab tobanle.
const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Marka foomka la diro, ku dar kharashka jadwalka oo cusboonaysii wadarta.
expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Ka akhri xogta meelaha foomka ku jira.
  const formData = new FormData(expenseForm);
  const name = formData.get("expense").trim();
  const amount = Number(formData.get("amount"));
  const category = expenseForm.elements.category.selectedOptions[0].textContent;
  const date = formData.get("date");

  // Samee saf cusub oo qoraalka isticmaalaha si ammaan ah u geliya.
  const row = document.createElement("tr");
  const nameCell = document.createElement("th");
  nameCell.scope = "row";
  nameCell.textContent = name;

  const categoryCell = document.createElement("td");
  categoryCell.textContent = category;

  const dateCell = document.createElement("td");
  const dateElement = document.createElement("time");
  dateElement.dateTime = date;
  dateElement.textContent = new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  );
  dateCell.append(dateElement);

  const amountCell = document.createElement("td");
  const amountElement = document.createElement("data");
  amountElement.value = amount.toFixed(2);
  amountElement.textContent = moneyFormat.format(amount);
  amountCell.append(amountElement);

  row.append(nameCell, categoryCell, dateCell, amountCell);
  expenseRows.prepend(row);

  // Ku dar kharashka cusub wadarta, dabadeed xisaabi inta miisaaniyadda ka hadhay.
  const updatedTotal = Number(spentTotal.value) + amount;
  const remaining = Number(monthlyBudget.value) - updatedTotal;
  spentTotal.value = updatedTotal.toFixed(2);
  spentTotal.textContent = moneyFormat.format(updatedTotal);
  budgetRemaining.value = remaining.toFixed(2);
  budgetRemaining.textContent = moneyFormat.format(remaining);

  // Nadiifi meelihii foomka si kharash kale loo gelin karo.
  expenseForm.reset();
});
