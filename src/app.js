import $ from "jquery";
import axios from "axios";
import Estimator from "./estimator";
export default class EstimatorApplication {
  constructor(estimatorContext) {
    this.estimator = new Estimator(estimatorContext);
    console.log("Creating Application");
    this.loading = false;
  }

  init(template) {
    this.loader(true);
    if (template && template.currencyCode) {
      this.estimator = new Estimator(template);
      this.loadSettingsFromTemplate(this.estimator.getEstimator());
    }

    this.initProjectSettingsTab();
    this.initImportExport();

    this.loader(false);
  }

  initProjectSettingsTab() {
    this.initTaskClassifications();
  }

  initTaskClassifications() {
    let self = this;
    $("#task_classification table tbody tr td button.add").on(
      "click",
      (evt) => {
        self.estimator.addTaskClassification("");
        $("#task_classification table tbody").append(`
                    <tr>
													<td><input type="text" size="30"/></td>
													<td><button class="add">+</button><button class="remove">-</button></td>
												</tr>
      `);
      }
    );

    $("#task_classification table tbody tr td button.remove").on(
      "click",
      (evt) => {
        let taskClassificationForRemoval = $(evt.target)
          .parent()
          .siblings()
          .eq(0)
          .children()
          .eq(0)
          .val();
        console.log(
          "removing task classification ",
          taskClassificationForRemoval
        );
        self.estimator.removeTaskClassification(taskClassificationForRemoval);
        $(evt.target).parent().parent().remove();

        if (
          !(
            Array.isArray($("#task_classification table tbody tr")) &&
            $("#task_classification table tbody tr").length > 1
          )
        ) {
          $("#task_classification table tbody").append(`
                      <tr>
                            <td><input type="text" size="30"/></td>
                            <td><button class="add">+</button><button class="remove">-</button></td>
                          </tr>
              `);
        }
      }
    );

    $("#task_classification table tbody tr td input").on("blur", (evt) => {});
  }

  initImportExport() {
    let $exportButton = $("#exportEstimator");
    let $importButton = $("#importEstimator");
    let $exportEstimation = $("#exportedEstimation");
    let $importEstimation = $("#importEstimation");
    let $importFromUrlForm = $("#importFromUrlForm");
    let $importEstimationURL = $("#importEstimationURL");
    let $copyToClipboardButton = $("#estimationCopyToClipboard");
    if ($exportButton && $exportEstimation) {
      this.bindEventforExport($exportButton, $exportEstimation);
      this.bindCopyToClipboard($copyToClipboardButton, $exportEstimation);
    }

    if ($importButton && $importEstimation) {
      this.bindEventforImport($importButton, $importEstimation);
    }

    if ($importFromUrlForm && $importEstimationURL) {
      this.bindEventforImportFromURL($importFromUrlForm, $importEstimationURL);
    }
  }

  bindCopyToClipboard(buttonEle, textEle) {
    let self = this;
    buttonEle.on("click", () => {
      var copyText = document.getElementById(textEle.attr("id"));

      /* Select the text field */
      copyText.select();
      copyText.setSelectionRange(
        0,
        textEle.val().length
      ); /*For mobile devices*/

      /* Copy the text inside the text field */
      document.execCommand("copy");

      self.addAlertMessage(
        "Content Copied!!",
        "alert-success alert-dismissible fade show",
        true
      );
    });
  }

  addAlertMessage(text, type, autoClose) {
    let alertId = "alt_msg_" + new Date().getTime();
    $(`
    <div id="${alertId}" class="alert ${type}" role="alert">
          <strong>${text}</strong>
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
      </div>`).appendTo(".notification_messages");

    if (autoClose) {
      window.setTimeout(() => {
        $("#" + alertId).remove();
      }, 1000);
    }
  }

  bindEventforExport(buttonEle, textAreaEle) {
    buttonEle.on("click", (evt) => {
      textAreaEle.val(JSON.stringify(this.estimator.getEstimator()));
    });
  }

  bindEventforImport(buttonEle, textAreaEle) {
    let self = this;
    buttonEle.on("click", (evt) => {
      try {
        self.init(JSON.parse(textAreaEle.val()));
        self.addAlertMessage(
          "Estimator imported!!",
          "alert-success alert-dismissible fade show",
          true
        );
        textAreaEle.val("");
      } catch (error) {
        self.addAlertMessage(error, "alert-danger alert-dismissible", false);
      }
    });
  }

  bindEventforImportFromURL(formEle, textEle) {
    let self = this;
    formEle.on("submit", (evt) => {
      self.importEstimatorFromUrl(textEle.val()).then(() => {
        textEle.val("");
        evt.preventDefault();
      });
    });
  }

  importEstimatorFromUrl(url) {
    return new Promise((resolve, reject) => {
      try {
        this.loader(true);
        this.getTemplateJsonFromUrl(url)
          .then((response) => {
            console.log(response);
            this.init(response.data);
            this.addAlertMessage(
              "Estimator imported!!",
              "alert-success alert-dismissible fade show",
              true
            );
            this.loader(false);
            resolve(true);
          })
          .catch((error) => {
            this.init();
            this.addAlertMessage(
              error,
              "alert-danger alert-dismissible",
              false
            );
            this.loader(false);
            reject(error);
          });
      } catch (error) {
        this.addAlertMessage(error, "alert-danger alert-dismissible", false);
        this.loader(false);
        reject(error);
      }
    });
  }

  getTemplateJsonFromUrl(url) {
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(function (response) {
          resolve(response);
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  }

  loadSettingsFromTemplate(template) {
    //load currency code
    let $currencyCode = $("#currency_definition input");
    $currencyCode.val(template.currencyCode);

    this.loadTaskClassification(template);

    this.loadProjectPhases(template);

    this.loadEstimationAspects(template);

    this.loadTaskComplexity(template);

    this.loadResourceTypes(template);

    this.loadCostAdditionsAndDeductions(template);

    this.loadFixedEstimations(template);
  }

  loadFixedEstimations(template) {
    if (template.fixedEstimations && template.fixedEstimations.length > 0) {
    }
  }

  loadTaskClassification(template) {
    if (template.taskClassification && template.taskClassification.length > 0) {
      let $taskClassification = $("#task_classification table tbody");
      $taskClassification.empty();
      template.taskClassification.forEach((task) => {
        $taskClassification.append(`
        <tr>
        <td><input type="text" size="30" value="${task}"/></td>
        <td><button class="add">+</button><button class="remove">-</button></td>
      </tr>
        `);
      });
    }
  }

  loadProjectPhases(template) {
    if (template.phases && template.phases.length > 0) {
      let $phases = $("#project_phases table tbody");
      $phases.empty();
      template.phases.forEach((phase) => {
        $phases.append(`
          <tr>
            <td><input type="text" size="30" value="${phase.name}"/></td>
            <td><input type="text" size="10" value="${phase.duration}"/></td>
            <td>
              <select>
                <option value="select option">Select Option</option>
                <option value="MONTHS">MONTHS</option>
                <option value="WEEKS">WEEKS</option>
                <option value="DAYS">DAYS</option>
                <option value="HOURS">HOURS</option>
              </select>
            </td>
            <td><button class="add">+</button><button class="remove">-</button></td>
          </tr>
          `);
        $phases.find("tr").last().find("td select").val(phase.units);
      });
    }
  }

  loadEstimationAspects(template) {
    if (template.estimationAspects && template.estimationAspects.length > 0) {
      let $estimationAspects = $("#estimate_aspects table tbody");
      $estimationAspects.empty();
      template.estimationAspects.forEach((aspect) => {
        $estimationAspects.append(`
          <tr>
            <td><input type="text" size="20" value="${aspect.name}"/></td>
            <td><button class="add">+</button><button class="remove">-</button></td>
          </tr>
          `);
      });
    }
  }

  loadTaskComplexity(template) {
    if (template.taskComplexity && template.taskComplexity.length > 0) {
      let $taskComplexity = $("#complexity_definition table tbody");
      $taskComplexity.empty();
      let aspectOptions = template.estimationAspects
        .map((aspect) => aspect.name)
        .reduce((result, item) => {
          return (result = result + `<option value="${item}">${item}</option>`);
        }, "");
      template.taskComplexity.forEach((complexity) => {
        $taskComplexity.append(`
          <tr>
            <td><input type="text" size="30" value="${complexity.name}"/></td>
            <td>
            <select>
            ${aspectOptions}
            </select>
            </td>
            <td><input type="text" size="10" value="${complexity.manHours}"/></td>
          
            <td><button class="add">+</button><button class="remove">-</button></td>
          </tr>
          `);

        $taskComplexity
          .find("tr")
          .last()
          .find("td select")
          .val(complexity.aspect);
      });
    }
  }

  loadResourceTypes(template) {
    if (template.resourceTypes && template.resourceTypes.length > 0) {
      let $resourceTypes = $("#resource_types table tbody");
      $resourceTypes.empty();
      template.resourceTypes.forEach((resource) => {
        $resourceTypes.append(`
          <tr>
												<td><input type="text" size="20" value="${resource.region}"/></td>
												<td><input type="text" size="30" value="${resource.description}"/></td>
												<td><input type="text" size="10" value="${resource.ratePerHour}"/></td>
												<td><input type="text" size="10" value="${resource.manHoursPerWeek}"/></td>
												<td><button class="add">+</button><button class="remove">-</button></td>
											</tr>
          `);
      });
    }
  }

  loadCostAdditionsAndDeductions(template) {
    if (
      template.costAdditionDeductions &&
      template.costAdditionDeductions.length > 0
    ) {
      let $costAdditionsDeductions = $(
        "#cost_additions_deductions table tbody"
      );
      $costAdditionsDeductions.empty();
      let phasesOptions = template.phases
        .map((phase) => phase.name)
        .reduce((result, item) => {
          return (result = result + `<option value="${item}">${item}</option>`);
        }, "");
      phasesOptions =
        `<option value="Overall">Overall</option>` + phasesOptions;
      template.costAdditionDeductions.forEach((cost) => {
        $costAdditionsDeductions.append(`
          <tr>
          <td><input type="text" size="20" value="${cost.name}"/></td>
          <td>	
            <select>
              ${phasesOptions}
            </select>
          </td>
          <td><input type="checkbox"/></td>
          <td><input type="text" size="20" value="${cost.value}"/></td>
          <td><input type="checkbox"/></td>
          <td><button class="add">+</button><button class="remove">-</button></td>
        </tr>
          `);
        let $lastTr = $costAdditionsDeductions.find("tr").last();
        $lastTr.find("td select").val(cost.phase);
        if (cost.percentage)
          $($lastTr.find("td input[type=checkbox]")[0]).attr(
            "checked",
            "checked"
          );
        if (cost.deduction)
          $($lastTr.find("td input[type=checkbox]")[1]).attr(
            "checked",
            "checked"
          );
      });
    }
  }

  loader(flag) {
    if (flag && !this.loading) {
      this.showLoading();
    } else if (!flag && this.loading) {
      this.hideLoading();
    }
  }

  showLoading() {
    if (!this.loading) {
      $("#notification_center .processing_notification").toggleClass(
        "invisible"
      );
    }
  }

  hideLoading() {
    if (this.loading) {
      $("#notification_center .processing_notification").toggleClass(
        "invisible"
      );
    }
  }
}
