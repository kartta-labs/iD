import { interpolateRgb as d3_interpolateRgb } from 'd3-interpolate';
import { event as d3_event, select as d3_select } from 'd3-selection';

import { t } from '../../util/locale';
import { modeSave } from '../../modes';
import { svgIcon } from '../../svg';
import { uiCmd } from '../cmd';
import { uiTooltipHtml } from '../tooltipHtml';
import { tooltip } from '../../util/tooltip';


export function uiToolAssociate(context) {

    var tool = {
        id: 'associate',
        label: 'Associate'
    };

    var button = null;
    var tooltipBehavior = null;
    var history = context.history();
    var key = 'a';
    var _current_footprint = null;

    function updateCurrentFootprint() {
        _current_footprint = null;
        if (context.selectedIDs().length == 1) {
	  var selectedID = context.selectedIDs()[0];
	  if (selectedID.includes('w')) {
	    _current_footprint = context.entity(selectedID);
	    if (_current_footprint.nodes[0] !=
		_current_footprint.nodes[_current_footprint.nodes.length - 1]) {
	      // current feature is a line and NOT closed
	      _current_footprint = null;
	    }
	  }
	}
    }

    function isDisabled() {
        updateCurrentFootprint();
        return _current_footprint == null?true:false;
    }

    function updateStatus() {
        if (button) {
            button
              .classed('disabled', isDisabled());
	}
    }

    function associate() {
        d3_event.preventDefault();
        if (!context.inIntro()) {
          // Undo/redo doesn't trigger the isDisabled, thus we need to call
	  // updateCurrentFootprint here again to get the latest update.
	  updateCurrentFootprint();
	  if (_current_footprint == null) {
	    return;
	  }
	  // further check if the current footprint ready for association!
	  if (context.selectedIDs()[0].includes('w-')) {
	    alert("footprint is NOT saved yet, please save it first!");
	    return;
	  }
	  for (var i = 0; i < _current_footprint.nodes.length; ++i) {
	    if (_current_footprint.nodes[i].includes('n-')) {
	      alert("footprint has UNSAVED updates, please either save or undo first!");
	      return;
	    }
	  }
	  var footprintId = context.selectedIDs()[0].replace("w", "");
	  var width = 2000;
	  var height = 1000;
	  var left = (screen.width - width) / 2;
	  var top = (screen.height - height) /4;
      var my_window = window.open(location.origin + '/nf/?query=' + footprintId, "Footprint facade association",
                                  "height=" + height + ",width=" + width + ",left=" + left + ",top=" + top);
      }
    }

    function bgColor() {
        var step;
        if (_numChanges === 0) {
            return null;
        } else if (_numChanges <= 50) {
            step = _numChanges / 50;
            return d3_interpolateRgb('#fff', '#ff8')(step);  // white -> yellow
        } else {
            step = Math.min((_numChanges - 50) / 50, 1.0);
            return d3_interpolateRgb('#ff8', '#f88')(step);  // yellow -> red
        }
    }

    tool.render = function(selection) {
        tooltipBehavior = tooltip()
            .placement('bottom')
            .html(true)
            .title(uiTooltipHtml('Associate selected footprint with facade', key))


        button = selection
            .append('button')
            .attr('class', 'associate disabled bar-button')
            .on('click', associate)
            .call(tooltipBehavior);

        button
          .call(svgIcon('#iD-icon-out-link'));

        updateStatus();

        context.keybinding()
            .on(key, associate, true);

        context
            .on('enter.associate', function() {
                if (button) {
                    button
                        .classed('disabled', isDisabled());
                }
            });

    };


    tool.uninstall = function() {
        context.keybinding()
            .off(key, true);

        button = null;
        tooltipBehavior = null;
    };

    return tool;
}
