class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  el: HTMLFormElement;

  constructor() {
    this.templateEl = <HTMLTemplateElement>(
      document.getElementById("project-input")
    );
    this.hostEl = <HTMLDivElement>document.getElementById("app");

    const importedNode = document.importNode(this.templateEl.content, true);
    this.el = <HTMLFormElement>importedNode.firstElementChild;
    this.attach();
  }

  private attach() {
    this.hostEl.insertAdjacentElement("afterbegin", this.el);
  }
}
