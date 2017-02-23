import os
import tornado.ioloop
import tornado.web
from jinja2 import Environment, FileSystemLoader
import sqlite3


template_path = os.path.join(os.path.dirname(__file__), 'views')
env = Environment(loader=FileSystemLoader(template_path))


class DiffHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(env.get_template('main.html').render())


class NextHandler(tornado.web.NextHandler):
    def get(self):
        uid = next(diffs)
        self.redirect('/diff/%s' % uid)


def make_app():
    return tornado.web.Application([
        (r"/diff/", MainHandler),
        (r"/next/", NextHandler),
    ])

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()
