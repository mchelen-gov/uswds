const behavior = require("../utils/behavior");
const select = require("../utils/select");
const FocusTrap = require("../utils/focus-trap");

const { CLICK } = require("../events");
const { prefix: PREFIX } = require("../config");

const MODAL = `.${PREFIX}-modal`;

const INITIAL_FOCUS = `${MODAL} *[data-focus]`;
const CLOSE_BUTTON = `.${PREFIX}-modal__close`;
const OVERLAY = `.${PREFIX}-overlay`;
const OPENERS = `.${PREFIX}-modal-open[aria-controls]`;
const CLOSERS = `${CLOSE_BUTTON}, .${PREFIX}-modal__scrim`;
const TOGGLES = [MODAL, OVERLAY].join(", ");
const INNERDIV = `.${PREFIX}-modal__inner`;

const ACTIVE_CLASS = "usa-js-mobile-nav--active";
const VISIBLE_CLASS = "is-visible";

let modal;

const isActive = () => document.body.classList.contains(ACTIVE_CLASS);

function toggleModal(active) {
  let originalOpener;
  let clickedElement = event.target;
  const { body } = document;
  const safeActive = typeof active === "boolean" ? active : !isActive();
  const modalId = clickedElement.getAttribute("aria-controls");
  const targetModal = safeActive ? document.getElementById(modalId) : document.querySelector(".usa-modal.is-visible");

  // Sets the clicked element to the close button
  // so esc key always closes modal
  if (event.type === "keydown" && targetModal !== null) {
    clickedElement = targetModal.querySelector(CLOSE_BUTTON)
  }

  // Make sure we click the opener
  // If it doesn't have an ID, make one
  // Store id as data attribute on modal
  if (clickedElement.classList.contains("usa-modal-open")) {
    if (this.getAttribute("id") === null) {
      originalOpener = `modal-${Math.floor(Math.random() * 900000) + 100000}`;
      this.setAttribute("id", originalOpener);
    } 
    else {
      originalOpener = this.getAttribute("id");
    }
    targetModal.setAttribute("data-opener", originalOpener);
  }

    
    // This is weird because can't do getAttribute on esc key
    
    //console.log(clickedElement.classList);
     //This basically stops the propagation by determining if
     //the clicked element is not a child element in the modal
     //and is also not a close button
    if ( clickedElement.closest(".usa-modal__inner") ) {

      if (clickedElement.classList.contains("usa-modal__close")) {
        // do nothing. move on.
      }
      else {
        event.stopPropagation();
        event.preventDefault();
        return false;
      }
      
    }

    body.classList.toggle(ACTIVE_CLASS, safeActive);

    if (targetModal !== null) {
        
      targetModal.classList.toggle(VISIBLE_CLASS, safeActive);
    
      modal.focusTrap = FocusTrap(targetModal, {
        Escape: onMenuClose,
      });
      modal.focusTrap.update(safeActive);
      

      const openFocusEl = targetModal.querySelector(INITIAL_FOCUS) ? targetModal.querySelector(INITIAL_FOCUS) : targetModal.querySelector(".usa-modal__inner");
      const returnFocus = document.getElementById(targetModal.getAttribute("data-opener"));
      console.log(returnFocus);
      const menuButton = body.querySelector(OPENERS);

      if (safeActive && openFocusEl) {
        // The modal window is opened. Focus is set to close button.

        // This if timeout could be fractal weirdness
        // in safari. But gives element a chance to appear
        // before setting focus.
        setTimeout(function(){ openFocusEl.focus(); }, 10);

        //document.addEventListener('keydown', function(event){    
        //  if(event.key === "Escape"){
        //    onMenuClose();
        //  }
        //}, { once: true });
      } else if (
        !safeActive &&
        menuButton &&
        returnFocus
      ) {
        // The modal window is closed.
        // Focus is returned to the opener 
        returnFocus.focus();
      }
    }
    return safeActive;
 
};

const setUpAttributes = (baseElement) => {
  const modalContent = baseElement;
  const outerDiv = document.createElement('div');
  const overlayDiv = document.createElement('div');

  // Rebuild the modal element
  modalContent.parentNode.insertBefore(outerDiv, modalContent);
  outerDiv.appendChild(modalContent);
  modalContent.parentNode.insertBefore(overlayDiv, modalContent);
  overlayDiv.appendChild(modalContent);

  // Add classes and attributes
  outerDiv.classList.add("usa-modal");
  overlayDiv.classList.add("usa-modal__scrim");
  modalContent.classList.remove("usa-modal");
  modalContent.classList.add("usa-modal__inner");
  const modalID = baseElement.getAttribute("id");
  const modalClosers = outerDiv.querySelectorAll(CLOSERS);
  const ariaLabel = baseElement.getAttribute("aria-labelledby");
  outerDiv.setAttribute("role", "dialog");
  outerDiv.setAttribute("id", modalID);
  outerDiv.setAttribute("aria-labelledby", ariaLabel);
  baseElement.removeAttribute("id");
  baseElement.removeAttribute("aria-labelledby");
  baseElement.setAttribute("tabindex", "-1");

  // Add aria-controls
  modalClosers.forEach((el) => {
    el.setAttribute("aria-controls", modalID);
    }
  );
}

const onMenuClose = () => {
  console.log("Hitting that escape key");
  modal.toggleModal.call(modal, false);
};

modal = behavior(
  {
    [CLICK]: {
      [OPENERS]: toggleModal,
      [CLOSERS]: toggleModal,
    },
  },
  {
    init(root) {
      select(MODAL, root).forEach((modalWindow) => {
        setUpAttributes(modalWindow);
      });   
    },
    focusTrap: null,
    toggleModal,
  }
);

module.exports = modal;