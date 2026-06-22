const dateInput = document.querySelector("#consultation-date");
const timeButtons = document.querySelectorAll(".time-options button");
const nameInput = document.querySelector("#consultation-name");
const emailInput = document.querySelector("#consultation-email");
const selection = document.querySelector("#consultation-selection");
const checkoutButton = document.querySelector("#consultation-checkout-button");
const demoMessage = document.querySelector("#consultation-demo-message");
const dateInputWrap = dateInput.closest(".date-input-wrap");

let selectedTime = "";

function updateDateInputAppearance() {
  dateInputWrap.classList.toggle("is-empty", !dateInput.value);
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
  const isReady = formattedDate && selectedTime && nameInput.value.trim() && hasValidEmail;

  selection.textContent = formattedDate && selectedTime
    ? `${formattedDate} at ${selectedTime}`
    : "Select a date and time";
  checkoutButton.disabled = !isReady;
}

timeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    timeButtons.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    selectedTime = button.dataset.time;
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

dateInput.addEventListener("change", updateDateInputAppearance);
updateDateInputAppearance();

checkoutButton.addEventListener("click", () => {
  demoMessage.textContent = "Demo complete: a live build would now open Stripe Checkout and reserve the selected time.";
});
