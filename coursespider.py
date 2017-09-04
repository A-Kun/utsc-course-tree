import json
import string
import requests
import re
import os
from bs4 import BeautifulSoup
from multiprocessing.pool import ThreadPool

# class Course(object):
#     def __init__(self, code, description = None, prerequisite = None, corequisite = None, exclusion = None):
#         self.code = code
#         self.description = description
#         self.prerequisite = prerequisite
#         self.corequisite = corequisite
#         self.exclusion = exclusion

def get_course_under_letter(letter):
    courses_dict = {}
    url_template = 'https://utsc.calendar.utoronto.ca/'
    url = url_template + 'list-of-courses/' + letter
    page = requests.get(url).content.decode('utf-8')
    soup = BeautifulSoup(page, 'html.parser')
    courses = soup.find_all('div', 'views-field views-field-field-course-title')
    for courseRow in courses:
        course_dict = {}
        course = courseRow.div
        title = course.get_text()
        course_dict['title'] = title
        course = course.a
        course_dict['code'] = course.string
        course_url = url_template + course['href']
        course_page = requests.get(course_url).content.decode('utf-8')
        course_soup = BeautifulSoup(course_page, 'html.parser')
        course_info = course_soup.find('div', 'content clearfix')
        # get the description
        description_soup = course_info.find('div', 'field field-name-body field-type-text-with-summary field-label-hidden')
        if description_soup:
            description = description_soup.find('p').get_text()
            course_dict['description'] = description
        # get the exclusion
        exclusion_soup = course_info.find('div', 'field field-name-field-exclusion1 field-type-text-with-summary field-label-inline clearfix')
        if exclusion_soup:
            exclusions_string = exclusion_soup.find('p').get_text()
            exclusions = re.findall('\w{4}\d{2}\w\d|\w{3}\d{3}\w+', exclusions_string)
            course_dict['exclusions'] = exclusions
        breadth_req_soup = course_info.find('div', 'field field-name-field-breadth-req field-type-list-text field-label-inline clearfix')
        # get br
        if breadth_req_soup:
            br = breadth_req_soup.find('div', 'field-item even').string
            course_dict['breath_req'] = br
        prerequisite_soup = course_info.find('div', 'field field-name-field-prerequisite1 field-type-text-with-summary field-label-inline clearfix')
        # get pre
        if prerequisite_soup:
            prerequisite_string = prerequisite_soup.find('p').get_text()
            prerequisite = re.findall('\w{4}\d{2}\w\d|\w{3}\d{3}\w+', prerequisite_string)
            course_dict['prerequisite'] = {'str': prerequisite_string, 'list': prerequisite}
        print(course_dict)
        courses_dict[course_dict['code']] = course_dict
        with open(letter + '.json', 'w') as file:
            json_str = json.dumps(courses_dict)
            file.write(json_str)

if __name__ == '__main__':
    letters = string.ascii_uppercase
    size = len(letters)
    pool = ThreadPool(processes=size)
    pool.map(get_course_under_letter, letters)
    pool.close()
    pool.join()