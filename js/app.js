$(document).foundation();

var elements;
var courses;
var selected = [];
var hovering;

function meetPre(course) {
  var prerequisite = courses[course].prerequisite ?
                     courses[course].prerequisite.list :
                     [];
  for (var i = 0; i < prerequisite.length; i++) {
    var nextBucket = prerequisite[i];
    var found = false;
    if (nextBucket.forEach) {
      for (var j = 0; j < nextBucket.length; j++) {
        var nextCourse = nextBucket[j];
        if (selected.indexOf(nextCourse) !== -1) {
          found = true;
          break;
        }
      }
    } else {
      if (selected.indexOf(nextBucket) !== -1) {
        found = true;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
}

function meetEx(course) {
  var exclusions = courses[course].exclusions ?
                   courses[course].exclusions :
                   [];
  var result = true;
  for (var i = 0; i < exclusions.length; i++) {
    var nextCourse = exclusions[i];
    if (selected.indexOf(nextCourse) !== -1) {
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
    var prerequisite = courses[nextSelected].prerequisite ?
                       courses[nextSelected].prerequisite.list :
                       [];
    for (var j = 0; j < prerequisite.length; j++) {
      var nextBucket = courses[nextSelected].prerequisite.list[j];
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
  if (selected.indexOf(course) !== -1) {
    result = 'callout success';
    if (isPreOfSelectedCourse(course)) {
      result += ' disabled';
    }
  } else {
    if (canTakeCourse(course)) {
      result = 'callout primary';
    } else {
      result = 'callout secondary disabled';
    }
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
  if (className.indexOf('disabled') !== -1) {
    return;
  }
  if (className.indexOf('primary') !== -1) {
    selected.push(course);
  } else if (className.indexOf('success') !== -1) {
    var index = selected.indexOf(course);
    if (index !== -1) {
      selected.splice(index, 1);
    }
  }
  refreshCourseStatus();
}

function populateHTML() {
  var html = '';
  var count = 0;
  Object.keys(courses).forEach(function(nextCourse) {
    if (nextCourse.indexOf('CSC') !== -1) {
      var title = courses[nextCourse].title;
      var preList = [];
      var prerequisite;
      var exclusions;
      console.log(courses[nextCourse]);
      if (courses[nextCourse].prerequisite) {
        courses[nextCourse].prerequisite.list.forEach(function(nextOrGroup) {
          if (nextOrGroup.forEach) {
            preList.push('[' + nextOrGroup.join(' or ') + ']');
          } else {
            preList.push(nextOrGroup);
          }
        });
        prerequisite = preList.join(' and ');
      }
      if (courses[nextCourse].exclusions) {
        exclusions = courses[nextCourse].exclusions.join(', ');
      }

      if (count === 0) {
        html += '<div class="row">';
      } else if (count % 4 === 0) {
        html += '</div><div class="row">';
      }
      html += '<div class="large-3 columns"><div id="' + nextCourse;
      html += '" class="callout"><h5>' + nextCourse;
      html += '</h5><p>' + title;
      html += '</p><p><b>Prerequisite:&nbsp;</b>' + (prerequisite ? prerequisite : 'None');
      html += '</p><p><b>Exclusion:&nbsp;</b>' + (exclusions ? exclusions : 'None');
      html += '</p></div></div>';
      count++;
    }
  });
  html += '</div>';
  document.getElementById('courses-canvas').innerHTML = html;
}

function mouseIn() {
  var hovered = this.id;
  refreshCourseStatus();
}

function mouseOut() {
  console.log('out');
}

$.getJSON('./courses/C.json', function(data) {
  courses = data;
  populateHTML();
  elements = $('.callout');
  elements.click(toggleCourse);
  // elements.hover(mouseIn, mouseOut);
  refreshCourseStatus();
});
