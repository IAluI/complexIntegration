'use strict';

import Swiper from 'swiper';
import 'bootstrap/js/dist/modal';
import debounce from 'lodash/debounce';
import svg4everybody from 'svg4everybody';

$(document).ready(() => {
  svg4everybody();

  $('a[href^="#"]').click(function (e) {
    e.preventDefault();
    var id = $(this).attr('href');
    var top = $(id).offset().top;
    $('html, body').animate({
      scrollTop: top
    }, 350);
  });

  let header = $('.Header');
  let jqWindow = $(window);
  let	scrollPrev = 0;

  jqWindow.scroll(debounce(function() {
    let scrolled = jqWindow.scrollTop();
  
    if ( scrolled > 100 && scrolled > scrollPrev ) {
      header.removeClass('Header_show');
    } else {
      header.addClass('Header_show');
    }
    scrollPrev = scrolled;
  },
  300,
  {
    maxWait: 300,
  }));
  
  let breakpoint = window.matchMedia('(min-width: 768px)');
  let projectsThumbs;
  let projectsSlider;

  let breakpointChecker = function () {
    if (breakpoint.matches === true) {
      if (projectsThumbs !== undefined) {
        projectsThumbs.destroy(true, true);
      }
      projectsThumbs = new Swiper('.Projects-SliderThumbs', {
        slidesPerView: 4,
        slidesPerColumn: 6,
        slidesPerColumnFill: 'row',
        allowTouchMove: false,
        loop: false,
        spaceBetween: 10,    
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
      });
    } else {
      if (projectsThumbs !== undefined) {
        projectsThumbs.destroy(true, true);
      }
      projectsThumbs = new Swiper('.Projects-SliderThumbs', {
        slidesPerView: 4,    
        loop: true,
        spaceBetween: 10,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
      });
    }
    if (projectsSlider !== undefined) {
      projectsSlider.destroy(true, true);
    }
    projectsSlider = new Swiper('.Projects-Slider', {
      slidesPerView: 1,
      loop: true,
      autoplay: {
        delay: 5000,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      thumbs: {
        swiper: projectsThumbs
      }
    });
  }

  breakpoint.addListener(breakpointChecker);
  breakpointChecker();  
});