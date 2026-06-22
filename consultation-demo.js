const dateInput = document.querySelector("#consultation-date");
const timeButtons = document.querySelectorAll(".time-options button");
const nameInput = document.querySelector("#consultation-name");
const emailInput = document.querySelector("#consultation-email");
const selection = document.querySelector("#consultation-selection");
const checkoutButton = document.querySelector("#consultation-checkout-button");
const demoMessage = document.querySelector("#consultation-demo-message");
const dateInputWrap = dateInput.closest(".date-input-wrap");
const dateInputDisplay = dateInputWrap.querySelector(".date-input-placeholder");

let selectedTime = "";
const defaultDemoMessage = "Prototype only. No appointment or payment will be submitted.";

function resetDemoMessage() {
  demoMessage.textContent = defaultDemoMessage;
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resetSelectedTime() {
  selectedTime = "";
  timeButtons.forEach((button) => {
    button.classList.remove("is-selected");
    button.setAttribute("aria-pressed", "false");
  });
}

function updateDateInputAppearance() {
  dateInputWrap.classList.toggle("is-empty", !dateInput.value);
  dateInputDisplay.textContent = dateInput.value
    ? formatSelectedDate(dateInput.value)
    : "Select a date";
}

function formatSelectedDate(value) {
  if (!value) return "";

  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function updateBookingState() {
  const formattedDate = formatSelectedDate(dateInput.value);
  const hasValidEmail = emailInput.validity.valid && emailInput.value.trim();
  const hasValidDate = formattedDate && dateInput.validity.valid;
  const isReady = hasValidDate && selectedTime && nameInput.value.trim() && hasValidEmail;

  selection.textContent = formattedDate && selectedTime
    ? `${formattedDate} at ${selectedTime}`
    : "Select a date and time";
  checkoutButton.disabled = !isReady;
}

timeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    timeButtons.forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
    selectedTime = button.dataset.time;
    resetDemoMessage();
    updateBookingState();
  });
});

[dateInput, nameInput, emailInput].forEach((input) => {
  input.addEventListener("input", updateBookingState);
});

dateInput.addEventListener("focus", () => {
  dateInputWrap.classList.add("is-focused");
});

dateInput.addEventListener("blur", () => {
  dateInputWrap.classList.remove("is-focused");
  updateDateInputAppearance();
});

dateInput.addEventListener("change", () => {
  resetSelectedTime();
  resetDemoMessage();
  updateDateInputAppearance();
  updateBookingState();
});
dateInput.addEventListener("input", updateDateInputAppearance);

dateInputWrap.addEventListener("click", (event) => {
  if (typeof dateInput.showPicker !== "function") return;

  event.preventDefault();
  try {
    dateInput.showPicker();
  } catch (error) {
    dateInput.focus();
  }
});

const today = new Date();
today.setHours(0, 0, 0, 0);
dateInput.min = formatDateForInput(today);
updateDateInputAppearance();

checkoutButton.addEventListener("click", () => {
  demoMessage.textContent = "Demo complete: a live build would now open Stripe Checkout and reserve the selected time.";
});
