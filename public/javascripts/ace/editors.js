/*global $, ace*/
/*exported Editors*/

function Editor(editorsDivId, lang) {
  "use strict";

  var self = this;

  // <textarea> is used in addition to ace editor (inside the <pre> tag)
  // so we can "restore" old state information while user navigates
  // using the browser forward/back buttons.
  this.$textarea = (function(lang) {
    var $textarea = $('textarea[name="typed_code_' + lang + '"]');
    $textarea.hide();
    return $textarea;
  }(lang));

  this.$editor = (function(element, lang) {
    var $editor = $('<div id="typed_code_' + lang + '"></div>');
    $editor.hide();
    $editor.css({
      fontSize: '14px',
      height: '400px',
      border: '1px solid #e0e0e0'
    });
    $(element).append($editor);
    return $editor;
  }(editorsDivId, lang));

  this.editor = (function(lang) {
    var editor = ace.edit(self.$editor.attr('id'));
    editor.setTheme("ace/theme/textmate");
    editor.setValue(self.$textarea.val(), -1);
    editor.getSession().setUseWrapMode(true);
    editor.setShowPrintMargin(false);
    editor.setDisplayIndentGuides(false);
    editor.setHighlightActiveLine(false);
    editor.setAutoScrollEditorIntoView();
    editor.setOption("minLines", 25);
    editor.getSession().on('change', function() {
      self.$textarea.val(self.getCode());
      self.updateHeight();
    });
    editor.getSession().setMode("ace/mode/" + getLangMode(lang));
    return editor;
  }(lang));

  function getLangMode(lang) {
    if (lang === 'c' || lang === 'cpp') {
      return 'c_cpp';
    }
    return lang;
  }

  this.show = function() {
    self.$editor.show();
  };

  this.hide = function() {
    self.$editor.hide();
  };

  this.getRaw = function() {
    return self.editor;
  };

  this.getCode = function() {
    return self.editor.getValue();
  };

  this.setCode = function(val) {
    self.editor.setValue(val, -1);
  };

  this.updateHeight = function() {
    self.editor.setOption("maxLines", self.editor.getSession().getScreenLength());
  };
}

var Editors = (function() {
  "use strict";

  var $langSelect;
  var langs;
  var editors;
  var currentEditor;

  function showEditor(langToShow) {
    currentEditor = editors[langToShow];
    currentEditor.show();
    for (var i = 0; i < langs.length; i++) {
      if (langs[i] !== langToShow) {
        editors[langs[i]].hide();
      }
    }
  }

  function bindUIActions() {
    $langSelect.change(function () {
      var lang = $(this).find(":selected").val();
      showEditor(lang);
    });
  }

  function initEditors(editorsDivId) {
    var editors = {};
    for (var i = 0; i < langs.length; i++) {
      editors[langs[i]] = new Editor(editorsDivId, langs[i]);
    }
    return editors;
  }

  return {
    init: function(editorsDivId, langSelectId, codeDefinitions) {
      $langSelect = $(langSelectId);
      langs = codeDefinitions;
      editors = initEditors(editorsDivId);
      showEditor($langSelect.find(":selected").val());
      bindUIActions();
    },

    getCurrentEditor: function() {
      return currentEditor;
    },

    getEditor: function(lang) {
      return editors[lang];
    }
  };
}());
