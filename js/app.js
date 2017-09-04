$(document).foundation();

var elements;
var courses;
var selected = [];

function meetPre(course) {
  var pre = courses[course].pre;
  for (var i = 0; i < pre.length; i++) {
    var nextBucket = pre[i];
    var found = false;

    for (var j = 0; j < nextBucket.length; j++) {
      var nextCourse = nextBucket[j];
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
  var ex = courses[course].ex;
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
    for (var j = 0; j < courses[nextSelected].pre.length; j++) {
      var nextBucket = courses[nextSelected].pre[j];
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
}

function toggleCourse() {
  var course = this.id;
  var className = this.className;
  if (className.indexOf('disabled') > -1) {
    return;
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

function populateHTML() {
  var html = '';
  var count = 0;
  Object.keys(courses).forEach(function(nextCourse) {
    var title = courses[nextCourse].title;
    var preList = [];
    courses[nextCourse].pre.forEach(function(nextOrGroup) {
      preList.push('[' + nextOrGroup.join(' or ') + ']');
    });
    var pre = preList.join(' and ');
    var ex = courses[nextCourse].ex.join(', ');

    if (count === 0) {
      html += '<div class="row">';
    } else if (count % 4 === 0) {
      html += '</div><div class="row">';
    }
    html += '<div class="large-3 columns"><div id="' + nextCourse;
    html += '" class="callout"><h5>' + nextCourse;
    html += '</h5><p>' + title;
    html += '</p><p><b>Prerequisite:&nbsp;</b>' + (pre ? pre : 'None');
    html += '</p><p><b>Exclusion:&nbsp;</b>' + (ex ? ex : 'None');
    html += '</p></div></div>';
    count++;
  });
  html += '</div>';
  document.getElementById('courses-canvas').innerHTML = html;
}

$.getJSON('./courses.json', function(data) {
  courses = data;
  populateHTML();
  elements = $('.callout');
  elements.click(toggleCourse);
  refreshCourseStatus();
});
