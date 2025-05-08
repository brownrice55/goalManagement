(function() {
  'use strict';

  let navAndCommon, settings;
  
  const NavAndCommon = function() {
    this.initialize.apply(this, arguments);
  };

  NavAndCommon.prototype.initialize = function() {
    let commonElms = this.commonElms();
    this.sectionElms = commonElms[0];
  };

  NavAndCommon.prototype.commonElms = function() {
    let sectionElms = document.querySelectorAll('.js-section');
    return [sectionElms];
  };

  NavAndCommon.prototype.getSettingsDataFromLocalStorage = function() {//要検討
    let settingsData = new Map();
    let settingsDataFromLocalStorage = localStorage.getItem('goalManagementSettingsData');
    if(settingsDataFromLocalStorage!=='undefined') {
      const dataJson = JSON.parse(settingsDataFromLocalStorage);
      settingsData = new Map(dataJson);
    }
    return settingsData;
  };
  
  NavAndCommon.prototype.displayGlobalNav = function() {
    this.sectionElms.forEach(elm => {
      elm.classList.add('d-none');
    });
    this.sectionElms[1].classList.remove('d-none');
  };

  NavAndCommon.prototype.setEvent = function() {
    this.displayGlobalNav();

  };

  NavAndCommon.prototype.run = function() {
    this.setEvent();
  };


  const Settings = function() {
    this.initialize.apply(this, arguments);
  };

  Settings.prototype.initialize = function() {
    this.settingsData = navAndCommon.getSettingsDataFromLocalStorage();
    let commonElms = navAndCommon.commonElms();
    this.sectionElms = commonElms[0];
    
    this.saveAndNextBtnElms = document.querySelectorAll('.js-saveAndNextBtn');
    this.id = 0;
  };

  Settings.prototype.saveAndNextData = function(aIndex) {
    this.settingsData.set(this.id, this.currentSettingsData);
    localStorage.setItem('goalManagementSettingsData', JSON.stringify([...this.settingsData]));

    let settingsSectionElms = document.querySelectorAll('.js-settingsSection');
    settingsSectionElms.forEach(elm=> {
      elm.classList.add('d-none');
    });
    settingsSectionElms[aIndex].classList.remove('d-none');
  };

  Settings.prototype.resetInput = function(aElms) {
    for(let cnt=0,len=aElms.length;cnt<len;++cnt) {
      aElms[cnt].value = '';
    }
  };

  Settings.prototype.setEventSettings1 = function() {
    let inputElms = this.sectionElms[1].querySelectorAll('input');
    let selectElm = this.sectionElms[1].querySelector('select');
    let goalListElm = this.sectionElms[1].querySelector('.js-goalList');

    const setDate = () => {
      let now = new Date();
      let dateY = now.getFullYear();
      let dateM = now.getMonth() + 1;
      let dateD = now.getDate();
      if(dateM<10) {
        dateM = '0' + dateM;
      }
      if(dateD<10) {
        dateD = '0' + dateD;
      }
      
      inputElms[2].value = dateY + '-' + dateM + '-' + dateD;
      inputElms[2].min = (dateY-1) + '-' + dateM + '-' + dateD;
      inputElms[2].max = (dateY+50) + '-' + dateM + '-' + dateD;
    };

    const hideOrShowGoalList = () => {
      if(this.settingsData.size) {
        goalListElm.parentNode.classList.remove('d-none');
      }
      else {
        goalListElm.parentNode.classList.add('d-none');
      }
    };

    setDate();

    const that = this;
    this.saveAndNextBtnElms[0].addEventListener('click', function() {
      that.id = 1; //仮
      that.currentSettingsData = new Map();
      that.currentSettingsData.goal = inputElms[0].value;
      that.currentSettingsData.radioPeriod = inputElms[1].checked;
      that.currentSettingsData.period = [ inputElms[2].value, selectElm.value ];
      let nextPageIndex = (inputElms[1].checked) ? 1 : 4;
      that.saveAndNextData(nextPageIndex);

      that.resetInput(inputElms);
      that.resetInput(selectElm);
      setDate();
      this.disabled = true;
    });

    inputElms[0].addEventListener('keyup', function() {
      that.saveAndNextBtnElms[0].disabled = (this.value) ? false : true;
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
    let deleteSettingBtnElms = document.querySelectorAll('.js-deleteSettingBtn');
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