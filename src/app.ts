//Project Type

enum ProjectStatus {
  Active,
  Finished,
  Canceled,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

//project state management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
class PrjState extends State<Project> {
  private projects: Project[] = [];
  private static instance: PrjState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new PrjState();
    return this.instance;
  }

  addPrj(title: string, desc: string, people: number) {
    const newPrj = new Project(
      Math.random().toString(),
      title,
      desc,
      people,
      ProjectStatus.Active
    );
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

//Base Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  el: U;

  constructor(
    templateId: string,
    hostElId: string,
    insertAtStart: boolean,
    newElId?: string
  ) {
    this.templateEl = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElId)! as T;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.el = importedNode.firstElementChild as U;
    if (newElId) {
      this.el.id = newElId;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtBegin: boolean) {
    this.hostEl.insertAdjacentElement(
      insertAtBegin ? "afterbegin" : "beforeend",
      this.el
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

//ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure() {}
  renderContent() {
    this.el.querySelector("h2")!.textContent = this.project.title;
    this.el.querySelector("h3")!.textContent = this.project.people.toString();
    this.el.querySelector("p")!.textContent = this.project.description;
  }
}

//Project List Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedPrj: Project[];

  constructor(private prjType: "active" | "finished" | "canceled") {
    super("project-list", "app", false, `${prjType}-projects`);
    this.assignedPrj = [];
    prjState.addListener((prjs: Project[]) => {
      const activePrj = prjs.filter((prj) => {
        if (this.prjType === "active") {
          return prj.status === ProjectStatus.Active;
        } else if (this.prjType === "canceled") {
          return prj.status === ProjectStatus.Canceled;
        } else {
          return prj.status === ProjectStatus.Finished;
        }
      });
      this.assignedPrj = activePrj;
      this.renderPrj();
    });
    this.configure();
    this.renderContent();
  }

  configure() {}

  renderContent() {
    const listId = `${this.prjType}-projects-list`;
    this.el.querySelector("ul")!.id = listId;
    this.el.querySelector("h2")!.textContent =
      this.prjType.toUpperCase() + " projects";
  }

  private renderPrj() {
    const listEl = document.getElementById(
      `${this.prjType}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedPrj) {
      new ProjectItem(this.el.querySelector("ul")!.id, prjItem); // ! hinst TS that we are sure there will be a value there, so no need for checks
    }
  }
}

// Project Input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInput = <HTMLInputElement>this.el.querySelector("#title");
    this.descriptionInput = <HTMLInputElement>(
      this.el.querySelector("#description")
    );
    this.peopleInput = <HTMLInputElement>this.el.querySelector("#people");
    this.configure();
  }
  configure() {
    this.el.addEventListener("submit", this.submitHandler);
  }
  renderContent() {}

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
}

const prjInput = new ProjectInput();
const actPrjList = new ProjectList("active");
const finPrjList = new ProjectList("finished");
const canPrjList = new ProjectList("canceled");
