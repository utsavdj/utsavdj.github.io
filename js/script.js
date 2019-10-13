document.getElementById('copyright-year').innerText = new Date().getFullYear().toString();

var education = [
  {
    institution: 'Kathmandu College of Management (KCM), Kathmandu, Nepal',
    degree: 'Bachelors in Business Administration (BBA), Emphasis: Finance',
    date: 'Aug 2011 - Dec 2015'
  },
  {
    institution: 'United Academy, Lalitpur, Nepal',
    degree: 'Higher Secondary Education Board (HSEB), Commerce',
    date: 'Sept 2008 - Nov 2010'
  },
  {
    institution: 'D.A.V. School, Lalitpur, Nepal',
    degree: 'School Leaving Certificate (SLC)',
    date: 'June 2008'
  }
];

var educationElement = document.getElementsByClassName('education')[0];

if(educationElement){
  var educationDetail = educationElement.getElementsByClassName('details')[0];
  for (var i = 0; i < education.length; i++){
    var educationDetailElement = document.createElement('div');
    educationDetailElement.classList.add('col-md-4');
    educationDetail.appendChild(educationDetailElement);

    var parentElement = educationDetail.getElementsByClassName('col-md-4')[i];

    var institution = document.createElement('strong');
    institution.innerText = education[i].institution;
    parentElement.appendChild(institution);

    var degree = document.createElement('p');
    degree.innerText = education[i].degree;
    parentElement.appendChild(degree);

    var date = document.createElement('p');
    date.innerText = education[i].date;
    parentElement.appendChild(date);
  }
}

var shuffleme = (function ($) {
  'use strict';
  var $grid = $('#grid'),
    $filterOptions = $('.portfolio-sorting li'),
    $sizer = $grid.find('.shuffle_sizer'),

    init = function () {

      setTimeout(function () {
        listen();
        setupFilters();
      }, 100);

      $grid.shuffle({
        itemSelector: '[class*="col-"]',
        sizer: $sizer
      });
    },

    setupFilters = function () {
      var $btns = $filterOptions.children();
      $btns.on('click', function (e) {
        e.preventDefault();
        var $this = $(this),
          isActive = $this.hasClass('active'),
          group = $this.data('group');

        $grid.shuffle('shuffle', group);
      });

      $btns = null;
    },

    listen = function () {
      var debouncedLayout = $.throttle(400, function () {
        $grid.shuffle('update');
      });

      $grid.find('img').each(function () {
        var proxyImage;

        if (this.complete && this.naturalWidth !== undefined) {
          return;
        }

        proxyImage = new Image();
        $(proxyImage).on('load', function () {
          $(this).off('load');
          debouncedLayout();
        });

        proxyImage.src = this.src;
      });

      setTimeout(function () {
        debouncedLayout();
      }, 800);
    };

  return {
    init: init
  };
}(jQuery));

$(document).ready(function () {
  shuffleme.init();
});

$(document).ready(function () {
  $('ul.portfolio-sorting li a').mousedown(function (e) {

    $('ul.portfolio-sorting li').removeClass('active');

    var $parent = $(this).parent();
    if (!$parent.hasClass('active')) {
      $parent.addClass('active');
    }
  });
});

$(function () {
  if(educationElement) {
    $.stellar({
      horizontalOffset: 350,
      verticalOffset: -28
    });
  }
});

$("#mobile-menu").on("click", function () {
  $(this).toggleClass("active");
});


function clickFunction() {
  document.getElementById("mobile-dropdown").classList.toggle("show");
  document.getElementById("push").classList.toggle("move");
  document.getElementById("display").classList.toggle("no-display");
  document.getElementById("push-img").classList.toggle("about-img-move");
}

// var $container = $('.masonry');
// $container.imagesLoaded(function () {
//   $container.masonry({
//     itemSelector: '.masonry-item'
//   });
// });

