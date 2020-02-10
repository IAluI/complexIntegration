import Swiper from 'swiper';
import 'bootstrap/js/dist/modal';
import debounce from 'lodash/debounce';

$(document).ready(() => {
  let header = $('.Header');
  let jqWindow = $(window);
	let	scrollPrev = 0;

  jqWindow.scroll(debounce(function() {
    console.log('ok')
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