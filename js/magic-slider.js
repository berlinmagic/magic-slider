/*
  magic-slider
  based on jQuery moutardeSlider / Coda-Slider v2.0 / Coda-Slider v2.1
  (based on jQuery Coda-Slider v2.0 - http://www.ndoherty.biz/coda-slider)
  MIT license.
*/

var sliderCount = 1;

$.fn.magicSlider = function(settings) {

  settings = $.extend({
    autoHeight: true,
    autoHeightEaseDuration: 1000,
    autoHeightEaseFunction: "easeInOutExpo",
    autoSlide: false,
    autoCycle: false,
    autoSlideInterval: 7000,
    autoSlideStopWhenClicked: true,
    crossLinking: false,
    dynamicArrows: true,
    dynamicArrowLeftText: "&#171;",
    dynamicArrowRightText: "&#187;",
    dynamicTabs: true,
    dynamicTabsAlign: "center",
    dynamicTabsPosition: "top",
    externalTriggerSelector: "a.xtrig",
    firstPanelToLoad: 1,
    panelTitleSelector: "h2.title",
    slideEaseDuration: 1000,
    slideEaseFunction: "easeInOutExpo",
	slideDirection: "horizontal", // "horizontal" / "vertical"
	carousel: false
  }, settings);
  
  return this.each(function(){
    
    var slider = $(this);
    
    // If we need arrows
	if (settings.dynamicArrows) {
		slider.parent().addClass("arrows");
		slider.before('<div class="magic-nav-left" id="magic-nav-left-' + sliderCount + '"><a href="#">' + settings.dynamicArrowLeftText + '</a></div>');
		slider.after('<div class="magic-nav-right" id="magic-nav-right-' + sliderCount + '"><a href="#">' + settings.dynamicArrowRightText + '</a></div>');
    };
    
    var 	panelWidth = slider.find(".panel").width(),
    		panelCount = slider.find(".panel").size(),
    		navClicks = 0; 		// Used if autoSlideStopWhenClicked = true
			last = false; 		// Used in carousel mode
			clon = ''; 			// Used in carousel mode => 'first' / 'last'


	if (settings.slideDirection == "horizontal"){
		
		var panelContainerWidth = (settings.carousel) ? panelWidth*( panelCount+1 ) : panelWidth*panelCount
		slider.css('height', 'auto');
		slider.find('.panel').css('height', 'auto');
		
	} else {
		
		var panelHeight = slider.find(".panel").height();
		var panelContainerWidth = panelWidth;
		var panelContaineroffset = new Array();
		var panelsHeights = new Array();
		var daHeight = 0;
		slider.find(".panel").each(function(index) {
			panelContaineroffset[ index ] =  daHeight;
		    daHeight = daHeight + $(this).height();
			panelsHeights[ index ] = $(this).height();
		});
		var panelContainerHeight = (settings.carousel) ? (daHeight + panelHeight) : daHeight
		// $('.magic-slider').css('width', 'auto');
		// $('.magic-slider .panel').css('width', 'auto');
		// $('.magic-slider').css('height', 'auto');
		// $('.magic-slider .panel').css('height', 'auto');
		var biggestPanel = Array_max( panelsHeights );
		if (settings.autoHeight != true) {
			daHeight = 0;
			slider.find(".panel").each(function(index) {
				panelContaineroffset[ index ] =  daHeight;
			    daHeight = daHeight + biggestPanel;
				panelsHeights[ index ] = biggestPanel;
				$(this).height( biggestPanel );
			});
		}
		
	};

	// Surround the collection of panel divs with a container div (wide enough for all panels to be lined up end-to-end)
	$('.panel', slider).wrapAll('<div class="panel-container"></div>');
	// Specify the width of the container div (wide enough for all panels to be lined up end-to-end)
	$(".panel-container", slider).css({ width: panelContainerWidth });
	if (settings.slideDirection != "horizontal") {
		$(".panel-container", slider).css({ height: panelContainerHeight });
	}



	// Initial Panel Load
	if (settings.crossLinking && location.hash && parseInt(location.hash.slice(1)) <= panelCount) {
		var currentPanel = parseInt(location.hash.slice(1));
	} else if (settings.firstPanelToLoad != 1 && settings.firstPanelToLoad <= panelCount) { 
		var currentPanel = settings.firstPanelToLoad;
	} else { 
		var currentPanel = 1;
	};
	moveToPanel(currentPanel);

	// Left-Nav = click
	$("#magic-nav-left-" + sliderCount + " a").click(function(){
		navClicks++;
		var navList = $(this).parents('div.magic-slider-wrapper').find('.magic-nav ul');
		if (currentPanel == 1 && !settings.carousel) {
			alterPanelHeight(panelCount - 1);
			currentPanel = panelCount;
		} else if (currentPanel == 1 && settings.carousel) {
			last = true;
			clon = 'last';
			alterPanelHeight(panelCount - 1);
			currentPanel = panelCount;
		} else {
			currentPanel -= 1;
			alterPanelHeight(currentPanel - 1);
		};
		moveToPanel(currentPanel);
		if (settings.crossLinking) { location.hash = currentPanel }; // Change the URL hash (cross-linking)
		return false;
	});

	// Right-Nav = click
	$('#magic-nav-right-' + sliderCount + ' a').click(function(){
		navClicks++;
		var navList = $(this).parents('div.magic-slider-wrapper').find('.magic-nav ul');
		if (currentPanel == panelCount && !settings.carousel) {
			currentPanel = 1;
			alterPanelHeight(0);
		} else if (currentPanel == panelCount && settings.carousel) {
			last = true;
			clon = 'first';
			currentPanel = 1;
			alterPanelHeight(0);
		} else {
			alterPanelHeight(currentPanel);
			currentPanel += 1;
		};
		moveToPanel(currentPanel);
		if (settings.crossLinking) { location.hash = currentPanel }; // Change the URL hash (cross-linking)
		return false;
    });



    // If we need a dynamic menu
    if (settings.dynamicTabs) {
      var dynamicTabs = '<div class="magic-nav" id="magic-nav-' + sliderCount + '"><ul></ul></div><div class="clearfix"></div>';
      switch (settings.dynamicTabsPosition) {
        case "bottom":
          slider.parent().append(dynamicTabs);
          break;
        default:
          slider.parent().prepend(dynamicTabs);
          break;
      };
      ul = $('#magic-nav-' + sliderCount + ' ul');
      // Create the nav items
      $('.panel', slider).each(function(n) {
		if ( $(this).find(settings.panelTitleSelector).length > 0 ) {
			ul.append('<li class="tab' + (n+1) + '"><a href="#' + (n+1) + '">' + $(this).find(settings.panelTitleSelector).text() + '</a></li>');
		} else {
			ul.append('<li class="tab' + (n+1) + '"><a href="#' + (n+1) + '">' + (n+1) + '</a></li>');
		}
                               
      });
      navContainerWidth = slider.width() + slider.siblings('.magic-nav-left').width() + slider.siblings('.magic-nav-right').width();
      ul.parent().css({ width: navContainerWidth });
      switch (settings.dynamicTabsAlign) {
        case "center":
          ul.css({ width: ($("li", ul).width() + 10) * panelCount });
          break;
        case "right":
          ul.css({ float: 'right' });
          break;
      };
    };



    // If we need a tabbed nav
    $('#magic-nav-' + sliderCount + ' a').each(function(z) {
      // What happens when a nav link is clicked
      $(this).bind("click", function() {
        navClicks++;
        alterPanelHeight(z);
        moveToPanel(z + 1)
        if (!settings.crossLinking) { return false }; // Don't change the URL hash unless cross-linking is specified
      });
    });



    // External triggers (anywhere on the page)
    $(settings.externalTriggerSelector).each(function() {
      // Make sure this only affects the targeted slider
      if (sliderCount == parseInt($(this).attr("rel").slice(13))) {
        $(this).bind("click", function() {
          navClicks++;
          targetPanel = parseInt($(this).attr("href").slice(1));
          offset = - (panelWidth*(targetPanel - 1));
          alterPanelHeight(targetPanel - 1);
          currentPanel = targetPanel;
          // Switch the current tab:
          slider.siblings('.magic-nav').find('a').removeClass('current').parents('ul').find('li:eq(' + (targetPanel - 1) + ') a').addClass('current');
          // Slide
          moveToPanel(currentPanel);
          if (!settings.crossLinking) { return false }; // Don't change the URL hash unless cross-linking is specified
        });
      };
    });



    // Specify which tab is initially set to "current". Depends on if the loaded URL had a hash or not (cross-linking).
    if (settings.crossLinking && location.hash && parseInt(location.hash.slice(1)) <= panelCount) {
      $("#magic-nav-" + sliderCount + " a:eq(" + (location.hash.slice(1) - 1) + ")").addClass("current");
    // If there's no cross-linking, check to see if we're supposed to load a panel other than Panel 1 initially...
    } else if (settings.firstPanelToLoad != 1 && settings.firstPanelToLoad <= panelCount) {
      $("#magic-nav-" + sliderCount + " a:eq(" + (settings.firstPanelToLoad - 1) + ")").addClass("current");
    // Otherwise we must be loading Panel 1, so make the first tab the current one.
    } else {
      $("#magic-nav-" + sliderCount + " a:eq(0)").addClass("current");
    };



    // Set the height of the first panel
    if (settings.autoHeight) {
		panelHeight = $('.panel:eq(' + (currentPanel - 1) + ')', slider).height();
		if (settings.slideDirection == "horizontal"){
			slider.css({ height: panelHeight });
		} else {
			slider.css({ height: panelsHeights[ currentPanel - 1 ] });
		};
      
    } else {
		if (settings.slideDirection != "horizontal"){
			slider.css({ height: panelsHeights[ currentPanel - 1 ] });
		}
	};



    // Trigger autoSlide
    if (settings.autoSlide) {
      slider.ready(function() {
        setTimeout(autoSlide,settings.autoSlideInterval);
      });
    };



    function alterPanelHeight(x) {
      if (settings.autoHeight) {
        panelHeight = $('.panel:eq(' + x + ')', slider).height()
        slider.animate({ height: panelHeight }, settings.autoHeightEaseDuration, settings.autoHeightEaseFunction);
      };
    };


    function autoSlide() {
      if (navClicks == 0 || !settings.autoSlideStopWhenClicked) {
        if (currentPanel == panelCount) {
          if(!settings.autoCycle)
            return false;
          currentPanel = 1;
        } else {
          currentPanel += 1;
        };
        alterPanelHeight(currentPanel - 1);
        moveToPanel(currentPanel);
        
        setTimeout(autoSlide,settings.autoSlideInterval);
      };
    };
    
	function moveToPanel(targetPanelIndex) {
		// Navigation
		var navList = slider.parents('div.magic-slider-wrapper').find('.magic-nav ul');
		var currentLink = navList.find('li:eq(' + (targetPanelIndex - 1) + ') a');
		navList.find('a').removeClass('current');
		currentLink.addClass('current');
		// Panel itself
		if ( last == true ) {
			doTheDouble( clon )
			last = false;
			clon = '';
		} else {
			doThePanelMove(targetPanelIndex);
		};
		slider.find('div.panel-container div.panel').removeClass('current');
		slider.find('div.panel-container div.panel:eq('+ (targetPanelIndex - 1) + ')').addClass('current');
    };


	function doThePanelMove(targetPanelIndex) {
		if (settings.slideDirection == "horizontal"){
			$('.panel-container', slider).animate(
				{ marginLeft: -1 * panelWidth*(targetPanelIndex -1) }, 
				settings.slideEaseDuration, 
				settings.slideEaseFunction
			);
		} else {
			$('.panel-container', slider).animate(
				{ marginTop: -1 * panelContaineroffset[ targetPanelIndex -1 ] }, 
				settings.slideEaseDuration, 
				settings.slideEaseFunction
			);
		}
    };


	function doTheDouble( clon ) {
		if ( clon == 'last' ) {
			slider.find('.panel:last-child').clone().addClass('duplicate').prependTo( slider.find('.panel-container') );
			if (settings.slideDirection == "horizontal") {
				$('.panel-container', slider).css("marginLeft", -panelWidth );
			} else {
				$('.panel-container', slider).css("marginTop", -panelsHeights[ panelCount -1 ] );
			};
		} else {
			slider.find('.panel:first-child').clone().addClass('duplicate').appendTo( slider.find('.panel-container') );
		};
		if (settings.slideDirection == "horizontal"){
			$('.panel-container', slider).animate(
				{ marginLeft: clon == 'last' ? 0 : -( panelWidth * panelCount ) }, 
				settings.slideEaseDuration, 
				settings.slideEaseFunction,
				function() {
					last = false;
					if (clon == 'last') {
						$(this).css( "marginLeft", -(panelWidth*(panelCount-1)) ).find('.panel.duplicate').remove();
					} else {
						$(this).css( "marginLeft", 0 ).find('.panel.duplicate').remove();
					}
				}
			);
		} else {
			$('.panel-container', slider).animate(
				{ marginTop: clon == 'last' ? 0 : -1 * (panelContaineroffset[ panelCount -1 ] + panelsHeights[ panelCount -1 ]) }, 
				settings.slideEaseDuration, 
				settings.slideEaseFunction,
				function() {
					last = false;
					if (clon == 'last') {
						$(this).css( "marginTop", -(panelContaineroffset[ panelCount -1 ]) ).find('.panel.duplicate').remove();
					} else {
						$(this).css( "marginTop", 0 ).find('.panel.duplicate').remove();
					}
				}
			);
		};
    };


	// little Helper to find the biggest Pannel
	function Array_max( array ){
		return Math.max.apply( Math, array );
	};

    
    sliderCount++;
    
  });
};