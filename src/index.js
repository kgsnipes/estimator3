import "./styles.css";
import "./app.js";
import EstimatorApplication from "./app.js";
import $ from "jquery";
import "popper.js";
import "bootstrap";


var estimatorContext={};
let estimatorApplication=new EstimatorApplication(estimatorContext);


$(function () {
  $('#myTab').tab();
 // $('#impex-tab').tab('show')

 estimatorApplication.importEstimatorFromUrl("https://crjgm.csb.app/templates/template.json");
});

  