(function() {
  'use strict';

  let navAndCommon, settings;
  
  const NavAndCommon = function() {
    this.initialize.apply(this, arguments);
  };

  NavAndCommon.prototype.initialize = function() {
    let commonElms = this.commonElmsAndData();
    this.settingsData = commonElms[0];
    this.sectionElms = commonElms[1];
    this.settingsSectionElms = commonElms[2];

    this.headerElm = document.querySelector('.js-header');
  };

  NavAndCommon.prototype.commonElmsAndData = function() {
    const getSettingsDataFromLocalStorage = () => {
      let settingsData = new Map();
      let settingsDataFromLocalStorage = localStorage.getItem('goalManagementSettingsData');
      if(settingsDataFromLocalStorage!=='undefined') {
        const dataJson = JSON.parse(settingsDataFromLocalStorage);
        settingsData = new Map(dataJson);
      }
      return settingsData;
    };

    let settingsData = getSettingsDataFromLocalStorage();
    let sectionElms = document.querySelectorAll('.js-section');
    let settingsSectionElms = document.querySelectorAll('.js-settingsSection');
    return [settingsData, sectionElms, settingsSectionElms];
  };

  NavAndCommon.prototype.switchPage = function(aIndex, aSectionElms) { //common
    aSectionElms.forEach(elm => {
      elm.classList.add('d-none');
    });
    if(aIndex==null) {
      let isComplete = false;// todo設定まで完了したらcompleteで毎日のtodo表示
      this.settingsData.forEach((val, key) => {
        if(val.status=='complete') {
          isComplete = true;
        }
      });
      aIndex = (isComplete) ? 0 : 1;
    }
    aSectionElms[aIndex].classList.remove('d-none');
  };

  NavAndCommon.prototype.closeGlobalMenu = function() {
    const that = this;
    const navbarNavElm = document.querySelector('.js-navbarNav');
    const globalNavBtnElm = document.querySelector('.js-globalNavBtn');
    const bsCollapse = new bootstrap.Collapse(navbarNavElm, { toggle: false });

    const mediaQueryList = window.matchMedia('(max-width: 992px)');
    let isOpen = false;
    const listener = (event) => {
      if (event.matches) {
        document.addEventListener('click', function(event) {
        isOpen = navbarNavElm.classList.contains('show');
          if (isOpen && !that.headerElm.contains(event.target)) {
            bsCollapse.hide();
          }
        });

        this.navItemElms.forEach( elm => {
          elm.addEventListener('click', function() {
            bsCollapse.hide();
          });
        });
      }
    };

    mediaQueryList.addEventListener('change', listener);
    listener(mediaQueryList);
  };

  NavAndCommon.prototype.hideAndShowGlobalNav = function() {
    if(this.settingsData.size) {
      this.headerElm.classList.remove('d-none');
    }
    else {
      this.headerElm.classList.add('d-none');
    }
  };

  NavAndCommon.prototype.setEvent = function() {
    this.switchPage(null, this.sectionElms);
    this.hideAndShowGlobalNav();

    const globalNavElms = document.querySelectorAll('.js-globalNav');
    const globalNavSettingsElms = document.querySelectorAll('.js-globalNavSettings');
    this.navItemElms = Object.setPrototypeOf( [ ...globalNavElms, ...globalNavSettingsElms ], NodeList.prototype );

    const that = this;
    const sectionIndex = [[0, 2], [0, 4, 5]];
    for(let cnt=0,len=globalNavElms.length;cnt<len;++cnt) {
      globalNavElms[cnt].addEventListener('click', function() {
        that.switchPage(sectionIndex[0][cnt], that.sectionElms);
      });
    }

    for(let cnt=0,len=globalNavSettingsElms.length;cnt<len;++cnt) {
      globalNavSettingsElms[cnt].addEventListener('click', function() {
        that.switchPage(1, that.sectionElms);
        that.switchPage(sectionIndex[1][cnt], that.settingsSectionElms);
      });
    }

    this.closeGlobalMenu();

  };

  NavAndCommon.prototype.run = function() {
    this.setEvent();
  };


  const Settings = function() {
    this.initialize.apply(this, arguments);
  };

  Settings.prototype.initialize = function() {
    let commonElms = navAndCommon.commonElmsAndData();
    this.settingsData = commonElms[0];
    this.sectionElms = commonElms[1];
    this.settingsSectionElms = commonElms[2];
    
    this.saveAndNextBtnElms = document.querySelectorAll('.js-saveAndNextBtn');
    this.inputAlertElms = document.querySelectorAll('.js-inputAlert');
    this.id = 0;
  };

  Settings.prototype.saveAndNextData = function(aIndex) {
    this.settingsData.set(this.id, this.currentSettingsData);
    localStorage.setItem('goalManagementSettingsData', JSON.stringify([...this.settingsData]));

    navAndCommon.switchPage(aIndex, this.settingsSectionElms);
  };

  Settings.prototype.resetInput = function(aElms) {
    for(let cnt=0,len=aElms.length;cnt<len;++cnt) {
      aElms[cnt].value = '';
    }
  };

  Settings.prototype.setEventSettings1 = function() {
    const inputElms = this.sectionElms[1].querySelectorAll('input');
    const selectElm = this.sectionElms[1].querySelector('select');
    const goalListElm = this.sectionElms[1].querySelector('.js-goalList');

    const inputGoalElm = inputElms[0];
    const inputRadioElm = inputElms[1];
    const inputPeriodStartElm = inputElms[2];
    const inputPeriodEndElm = inputElms[3];
    const inputModalElm = inputElms[4];

    const setDate = (aEnd, aElm) => {
      let now = new Date();
      if(aEnd) {
        now.setDate(now.getDate()+1);
      }
      let dateY = now.getFullYear();
      let dateM = now.getMonth() + 1;
      let dateD = now.getDate();
      if(dateM<10) {
        dateM = '0' + dateM;
      }
      if(dateD<10) {
        dateD = '0' + dateD;
      }
      
      aElm.value = dateY + '-' + dateM + '-' + dateD;
      aElm.min = (aEnd) ? aElm.value : (dateY-1) + '-' + dateM + '-' + dateD;
      aElm.max = (dateY+50) + '-' + dateM + '-' + dateD;
    };

    const hideOrShowGoalList = () => {
      if(this.settingsData.size) {
        goalListElm.parentNode.classList.remove('d-none');
      }
      else {
        goalListElm.parentNode.classList.add('d-none');
      }
    };

    setDate(false, inputPeriodStartElm);
    setDate(true, inputModalElm);

    const that = this;
    this.saveAndNextBtnElms[0].addEventListener('click', function() {
      that.id = 1; //仮
      that.currentSettingsData = new Map();
      that.currentSettingsData.goal = inputGoalElm.value;
      that.currentSettingsData.status = 1;
      that.currentSettingsData.radioPeriod = inputRadioElm.checked;
      that.currentSettingsData.period = [ inputPeriodStartElm.value, (selectElm.value!='custom') ? selectElm.value : inputPeriodEndElm.value ];
      let nextPageIndex = (inputRadioElm.checked) ? 1 : 4;
      that.saveAndNextData(nextPageIndex);

      that.resetInput(inputElms);
      that.resetInput(selectElm);
      this.disabled = true;
    });

    let duplication = false;
    inputGoalElm.addEventListener('keyup', function() {
      that.settingsData.forEach((val, key) => {
        if(val.goal==this.value) {
          that.inputAlertElms[0].textContent = '既に登録済みです';
          that.inputAlertElms[0].classList.remove('d-none');
          this.classList.add('border-danger');
          duplication = true;
        }
        else {
          that.inputAlertElms[0].textContent = '';
          that.inputAlertElms[0].classList.add('d-none');
          this.classList.remove('border-danger');
          duplication = false;
        }
      });
      that.saveAndNextBtnElms[0].disabled = (!duplication && this.value) ? false : true;
    });

    const modalElm = document.querySelector('.js-modal');
    const bsModal = new bootstrap.Modal(modalElm);
    selectElm.addEventListener('change', function() {
      if(this.value=='custom'){
        bsModal.show();
      }
    });

    modalElm.addEventListener('hide.bs.modal', () => {
      if(document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    const periodCustomBtnElm = document.querySelector('.js-periodCustomBtn');
    periodCustomBtnElm.addEventListener('click', function() {
      inputPeriodEndElm.classList.remove('d-none');
      selectElm.classList.add('d-none');
      inputPeriodEndElm.value = inputModalElm.value;
      inputPeriodEndElm.min = inputModalElm.min;
      inputPeriodEndElm.max = inputModalElm.max;
    });

    const periodCancelBtnElms = document.querySelectorAll('.js-periodCancelBtn');
    periodCancelBtnElms.forEach(elm => {
      elm.addEventListener('click', function() {
        selectElm.value = 1;
      });
    });

    let goalListResult = '';
    this.settingsData.forEach((val, key) => {
      goalListResult += `<div class="d-flex flex-row justify-content-between">
        <div class="flex-grow-1 align-self-center">` + val.goal + `</div>
        <button class="btn js-editSettingBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
          </svg>
        </button>
        <button class="btn js-deleteSettingBtn" data-key="` + key + `">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        </button>
      </div>`;
    });

    goalListElm.innerHTML = goalListResult;

    hideOrShowGoalList();
    const deleteSettingBtnElms = document.querySelectorAll('.js-deleteSettingBtn');
    deleteSettingBtnElms.forEach(elm => {
      elm.addEventListener('click', function() {
        that.settingsData.delete(parseInt(this.dataset.key));
        localStorage.setItem('goalManagementSettingsData', JSON.stringify([...that.settingsData]));
        hideOrShowGoalList();
      });
    });

  };

  Settings.prototype.setEvent = function() {
    this.setEventSettings1();
  };

  Settings.prototype.run = function() {
    this.setEvent();
  };


  window.addEventListener('DOMContentLoaded', function() {
    navAndCommon = new NavAndCommon();
    navAndCommon.run();

    settings = new Settings();
    settings.run();
  });

}());