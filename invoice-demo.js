const lookupForm = document.querySelector("#invoice-lookup-form");
const emailInput = document.querySelector("#invoice-email");
const emailDisplay = document.querySelector("#invoice-email-display");
const invoiceResult = document.querySelector("#invoice-result");
const methodButtons = document.querySelectorAll(".invoice-method-options button");
const methodSelection = document.querySelector("#invoice-method-selection");
const payButton = document.querySelector("#invoice-pay-button");
const demoMessage = document.querySelector("#invoice-demo-message");

lookupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!emailInput.validity.valid) {
    emailInput.reportValidity();
    return;
  }

  emailDisplay.textContent = emailInput.value.trim();
  invoiceResult.hidden = false;
  demoMessage.textContent = "Demo invoice loaded. Choose a payment method to continue.";
  invoiceResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

methodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    methodButtons.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    methodSelection.textContent = button.dataset.method;
    payButton.disabled = false;
  });
});

payButton.addEventListener("click", () => {
  demoMessage.textContent = "Demo complete: a live build would now open Stripe Checkout for invoice CWS-0001.";
});
