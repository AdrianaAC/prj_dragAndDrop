//project state management
class PrjState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: PrjState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new PrjState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addPrj(title: string, desc: string, people: number) {
    const newPrj = {
      id: Math.random().toString(),
      title: title,
      desc: desc,
      people: people,
    };
    this.projects.push(newPrj);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const prjState = PrjState.getInstance();

//Validation
interface ToValidate {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

function validate(validation: ToValidate) {
  let isValid = true;

  if (validation.required) {
    isValid = isValid && validation.value.toString().trim().length !== 0;
  }
  if (validation.minLength != null && typeof validation.value === "string") {
    isValid = isValid && validation.value.length > validation.minLength;
  }
  if (validation.maxLength != null && typeof validation.value === "string") {
    isValid = isValid && validation.value.length < validation.maxLength;
  }
  if (validation.minValue != null && typeof validation.value === "number") {
    isValid = isValid && validation.value > validation.minValue;
  }
  if (validation.maxValue != null && typeof validation.value === "number") {
    isValid = isValid && validation.value < validation.maxValue;
  }

  return isValid;
}

//autoBind decorator
function autobind(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const ogMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = ogMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

//Project List class
class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  el: HTMLElement;
  assignedPrj: any[];

  constructor(private prjType: "active" | "finished" | "canceled") {
    this.templateEl = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;
    this.assignedPrj = [];

    const importedNode = document.importNode(this.templateEl.content, true);
    this.el = importedNode.firstElementChild as HTMLElement;
    this.el.id = `${this.prjType}-projects`;
    prjState.addListener((prjs: any[]) => {
      this.assignedPrj = prjs;
      this.renderPrj();
    });

    this.attach();
    this.renderContent();
  }

  private renderPrj() {
    const listEl = document.getElementById(
      `${this.prjType}-projects-list`
    )! as HTMLUListElement;
    for (const prjItem of this.assignedPrj) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl?.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.prjType}-projects-list`;
    this.el.querySelector("ul")!.id = listId;
    this.el.querySelector("h2")!.textContent =
      this.prjType.toUpperCase() + " projects";
  }

  private attach() {
    this.hostEl.insertAdjacentElement("beforeend", this.el);
  }
}

// Project Input class
class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  el: HTMLFormElement;
  titleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor() {
    this.templateEl = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.el = importedNode.firstElementChild as HTMLFormElement;
    this.el.id = "user-input";

    this.titleInput = <HTMLInputElement>this.el.querySelector("#title");
    this.descriptionInput = <HTMLInputElement>(
      this.el.querySelector("#description")
    );
    this.peopleInput = <HTMLInputElement>this.el.querySelector("#people");

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInput.value;
    const enteredDesc = this.descriptionInput.value;
    const enteredPeople = this.peopleInput.value; //although the input is a number, the fetched value will be a string

    const titleValidation: ToValidate = {
      value: enteredTitle,
      required: true,
    };
    const descValidation: ToValidate = {
      value: enteredDesc,
      required: true,
      maxLength: 501,
      minLength: 0,
    };
    const peopleValidation: ToValidate = {
      value: +enteredPeople,
      required: true,
      minValue: 0,
      maxValue: 31,
    };
    if (
      !validate(titleValidation) ||
      !validate(descValidation) ||
      !validate(peopleValidation)
    ) {
      alert("Invalid input, please review your entered data and try again");
      return;
    } else {
      return [enteredTitle, enteredDesc, +enteredPeople]; //+ converts the data to a number
    }
  }

  private clearInput() {
    this.titleInput.value = "";
    this.descriptionInput.value = "";
    this.peopleInput.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      //Checking  if its an array, a tuple is an array
      const [title, desc, people] = userInput;
      prjState.addPrj(title, desc, people);
      this.clearInput();
    }
  }

  private configure() {
    this.el.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostEl.insertAdjacentElement("afterbegin", this.el);
  }
}

const prjInput = new ProjectInput();
const actPrjList = new ProjectList("active");
const finPrjList = new ProjectList("finished");
const canPrjList = new ProjectList("canceled");
