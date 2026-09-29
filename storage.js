// Furaha xogta tracker-kan ee browser-ka localStorage.
const EXPENSES_STORAGE_KEY = "pennywise-expenses-v1";

// Hubi in xogta la soo celinayo ay leedahay qaab kharash sax ah.
function isValidExpense(expense) {
  return (
    expense &&
    typeof expense.id === "string" &&
    typeof expense.name === "string" &&
    expense.name.trim().length > 0 &&
    ["food", "transport", "shopping", "bills", "other"].includes(expense.category) &&
    /^\d{4}-\d{2}-\d{2}$/.test(expense.date) &&
    Number.isFinite(Number(expense.amount)) &&
    Number(expense.amount) > 0
  );
}

// Adeegyada lagu akhriyo laguna kaydiyo kharashyada browser-ka.
window.expenseStorage = {
  load() {
    try {
      const savedData = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (!savedData) return [];

      const expenses = JSON.parse(savedData);
      return Array.isArray(expenses) ? expenses.filter(isValidExpense) : [];
    } catch (error) {
      // Haddii xogtu xumaato ama kaydku furnaan waayo, boggu ha sii shaqeeyo.
      console.warn("Kharashyada lama akhrin karin localStorage-ka.", error);
      return [];
    }
  },

  save(expenses) {
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
      return true;
    } catch (error) {
      // Browser-ka qaarkii wuxuu xannibi karaa kaydinta xogta.
      console.warn("Kharashyada lama kaydin karin localStorage-ka.", error);
      return false;
    }
  }
};
