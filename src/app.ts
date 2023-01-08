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

    if (
      enteredTitle.trim().length === 0 ||
      enteredDesc.trim().length === 0 ||
      enteredPeople.trim().length === 0
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
      console.log(title, desc, people);
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
