/**
 * @classdesc A component in which users can edit their own cookbooks
 */
class EditCookbook extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/source/styles/edit-cookbook.css";
  
    const editCookbook = document
      .getElementById("edit-cookbook-template")
      .content.cloneNode(true);
  
    this.shadowRoot.append(stylesheet);
    this.shadowRoot.append(editCookbook);
  }
}
  
customElements.define("edit-cookbook", EditCookbook);
  