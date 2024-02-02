"use strict";

(function () {
  function _ojIsIE11() {
    var nAgt = navigator.userAgent;
    return nAgt.indexOf("MSIE") !== -1 || !!nAgt.match(/Trident.*rv:11./);
  }
  var _ojNeedsES5 = _ojIsIE11();

  requirejs.config({
    baseUrl: "js", //relative to html, you have to be able find src="js/blahblah" from your html

    paths: {
      knockout:
        "https://20191221-ojet-staging.netlify.com/js/libs/knockout/knockout-3.5.0.debug",
      jquery:
        "https://20191221-ojet-staging.netlify.com/js/libs/jquery/jquery-3.4.1",
      "jqueryui-amd":
        "https://20191221-ojet-staging.netlify.com/js/libs/jquery/jqueryui-amd-1.12.1",
      promise:
        "https://20191221-ojet-staging.netlify.com/js/libs/es6-promise/es6-promise",
      hammerjs:
        "https://20191221-ojet-staging.netlify.com/js/libs/hammer/hammer-2.0.8",
      ojdnd:
        "https://20191221-ojet-staging.netlify.com/js/libs/dnd-polyfill/dnd-polyfill-1.0.1",
      ojs:
        "https://20191221-ojet-staging.netlify.com/js/libs/oj/v8.0.0/debug" +
        (_ojNeedsES5 ? "_es5" : ""),
      ojL10n:
        "https://20191221-ojet-staging.netlify.com/js/libs/oj/v8.0.0/ojL10n",
      ojtranslations:
        "https://20191221-ojet-staging.netlify.com/js/libs/oj/v8.0.0/resources",
      persist:
        "https://20191221-ojet-staging.netlify.com/js/libs/persist/debug",
      text: "https://20191221-ojet-staging.netlify.com/js/libs/require/text",
      signals:
        "https://20191221-ojet-staging.netlify.com/js/libs/js-signals/signals",
      touchr: "https://20191221-ojet-staging.netlify.com/js/libs/touchr/touchr",
      "regenerator-runtime":
        "https://20191221-ojet-staging.netlify.com/js/libs/regenerator-runtime/runtime",
      corejs: "https://20191221-ojet-staging.netlify.com/js/libs/corejs/shim",
      customElements:
        "https://20191221-ojet-staging.netlify.com/js/libs/webcomponents/custom-elements.min",
      proj4:
        "https://20191221-ojet-staging.netlify.com/js/libs/proj4js/dist/proj4-src",
      css: "https://20191221-ojet-staging.netlify.com/js/libs/require-css/css",
      "css-builder":
        "https://20191221-ojet-staging.netlify.com/js/libs/require-css/css-builder",
      normalize:
        "https://20191221-ojet-staging.netlify.com/js/libs/require-css/normalize",
    },
  });
})();

require([
  "ojs/ojcore",
  "knockout",
  "ojs/ojbootstrap",
  "firebaseReaderAndWriter",
  "ojs/ojarraydataprovider",
  "ojs/ojarraytreedataprovider",
  "ojs/ojattributegrouphandler",
  "ojs/ojknockout",
  "ojs/ojsunburst",
], function (
  oj,
  ko,
  Bootstrap,
  firebaseReaderAndWriter,
  ArrayDataProvider,
  ArrayTreeDataProvider,
  attributeGroupHandler
) {
  function ViewModel() {
    var colorHandler = new attributeGroupHandler.ColorAttributeGroupHandler();
    // colorHandler.addMatchRule('Headquarters', 'orange');
    // colorHandler.addMatchRule('2nd Quartile', 'red');
    // colorHandler.addMatchRule('3rd Quartile', '#2888C3');
    this.getColor = function(label) { 
      return colorHandler.getValue(label); 
    };
    
    const data = ko.observableArray([]);
    const firebaseJSONDataHandler = (snapObj) => {
      return recursionProcess(snapObj)
    }
    const recursionProcess = (snapObj) => {
      let array = Object.values(snapObj);
      for (let arrayElement of array) {
        if ("items" in arrayElement) {
          arrayElement.items = recursionProcess(arrayElement.items);
        }
      }
      return array
    }
    
    firebaseReaderAndWriter.readDataFromFirebase("programming/items", data, firebaseJSONDataHandler);

    this.sunburstData = new ArrayTreeDataProvider(data, {
      keyAttributes: "label",
      childrenAttribute: "items",
    });
    
    var tooltipElem = document.createElement("div");  //this is one copy of variable in the scope instance - considered as closure

    // Set a thick border for the tooltip
    tooltipElem.style.borderWidth = "4px;";

    // Add tooltip text and a pie chart
    tooltipElem.innerHTML =
      '<div style="float:left; padding: 10px 8px 10px 3px;">' +
      '<pre style="font-weight:bold;color:#606060"></pre>' +
      "</div>"

    function tooltipFunction(tooltipContext) {   
      var textElems = tooltipElem.children[0];
      textElems.children[0].textContent = tooltipContext.itemData.desc;
      return { insert: tooltipElem };
    }
    this.tooltipFunction = tooltipFunction.bind(this);
  }

  var viewModel = new ViewModel();

  Bootstrap.whenDocumentReady().then(function () {
    ko.applyBindings(viewModel, document.getElementById("main"));
     $('#sunburst').dblclick(  //because single click has been hijacked by ojet sunburst to allow drilldown, so you have to use dblclick to go to external link
      function(event) {
          var nodeContext;
          if (event.target.id !== 'sunburst')
             nodeContext = $('#sunburst').ojSunburst('getContextByNode', event.target);

          if (nodeContext){
              var indices = nodeContext['indexPath'];
              var node = $('#sunburst').ojSunburst('getNode', indices);
              var url = node.tooltip; 
              if(url) {
                //go to that link
                //window.location.href = url; //will override the current tab
                window.open(url, '_blank');
              }
          }
    });
  });
});
