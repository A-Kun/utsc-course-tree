$(document).foundation()

var elements = $('.callout');
var courses = {
  'MGEA01H3': {
    'pre': [],
    'ex': ['MGEA02H3'],
  },
  'MGEA02H3': {
    'pre': [],
    'ex': ['MGEA01H3'],
  },
  'MGEA05H3': {
    'pre': [],
    'ex': ['MGEA06H3'],
  },
  'MGEA06H3': {
    'pre': [],
    'ex': ['MGEA05H3'],
  },
  'MGEB01H3': {
    'pre': [['MGEA01H3', 'MGEA02H3'], ['MGEA05H3', 'MGEA06H3']],
    'ex': ['MGEB02H3'],
  },
  'MGEB02H3': {
    'pre': [['MGEA02H3'], ['MGEA06H3']],
    'ex': ['MGEB01H3'],
  },
  'MGEB05H3': {
    'pre': [['MGEA01H3', 'MGEA02H3'], ['MGEA05H3', 'MGEA06H3']],
    'ex': ['MGEB06H3'],
  },
  'MGEB06H3': {
    'pre': [['MGEA02H3'], ['MGEA06H3']],
    'ex': ['MGEB05H3'],
  },
}
var selected = [];

function meetPre(course) {
  var pre = courses[course]['pre'];
  for (var i = 0; i < pre.length; i++) {
    var nextBucket = pre[i];
    var found = false;
    for (var j = 0; j < nextBucket.length; j++) {
      var nextCourse = nextBucket[j];
      //console.log(nextCourse);
      if (selected.indexOf(nextCourse) > -1) {
        found = true;
        break;
      }
    }

    if (!found) {
      return false;
    }
  }
  return true;
}

function meetEx(course) {
  var ex = courses[course]['ex'];
  var result = true;
  for (var i = 0; i < ex.length; i++) {
    var nextCourse = ex[i];
    if (selected.indexOf(nextCourse) > -1) {
      result = false;
    }
  }
  return result;
}

function canTakeCourse(course) {
  return meetPre(course) && meetEx(course);
}

function isPreOfSelectedCourse(course) {
  for (var i = 0; i < selected.length; i++) {
    var nextSelected = selected[i];
    for (var j = 0; j < courses[nextSelected]['pre'].length; j++) {
      var nextBucket = courses[nextSelected]['pre'][j];
      for (var k = 0; k < nextBucket.length; k++) {
        var nextCourse = nextBucket[k];
        if (nextCourse === course) {
          return true;
        }
      }
    }
  }
  return false;
}

function getClassName(course) {
  var result;
  if (selected.indexOf(course) > -1) {
    result = 'callout success';
    if (isPreOfSelectedCourse(course)) {
      result += ' disabled';
    }
  } else if (canTakeCourse(course)) {
    result = 'callout primary';
  } else {
    result = 'callout secondary disabled';
  }
  return result;
}

function refreshCourseStatus() {
  for (var i = 0; i < elements.length; i++) {
    nextElement = elements[i];
    nextElement.className = getClassName(nextElement.id);
  }
};

function toggleCourse() {
  var course = this.id;
  var className = this.className;
  if (className.indexOf('disabled') > -1) {
    return
  }
  if (className.indexOf('primary') > -1) {
    selected.push(course);
  } else if (className.indexOf('success') > -1) {
    var index = selected.indexOf(course);
    if (index > -1) {
      selected.splice(index, 1);
    }
  }
  refreshCourseStatus();
}

(function initialize() {
  elements.click(toggleCourse);
  refreshCourseStatus();
})();
