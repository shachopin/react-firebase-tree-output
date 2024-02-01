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
      return process(snapObj)
    }
    const process = (snapObj) => {
      let array = Object.values(snapObj);
      for (let arrayElement of array) {
        if ("items" in arrayElement) {
          arrayElement.items = process(arrayElement.items);
        }
      }
      return array
    }
    
    firebaseReaderAndWriter.readDataFromFirebase("programming/items", data, firebaseJSONDataHandler);

    this.sunburstData = new ArrayTreeDataProvider(data, {
      keyAttributes: "label",
      childrenAttribute: "items",
    });
  }

  var viewModel = new ViewModel();

  Bootstrap.whenDocumentReady().then(function () {
    ko.applyBindings(viewModel, document.getElementById("main"));
  });
});
