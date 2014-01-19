import random
from django.http import HttpResponse

DIRECTIONS = {
    'down': (-1, 0),
    'right': (0, 1),
    'up': (1, 0),
    'left': (0, -1),
}


def get_possible_moves(head, snakes, n, w, h, faster=False):
    head_y, head_x = head
    for name, (my, mx) in DIRECTIONS.items():
        current_y = head_y + my
        current_x = head_x + mx
        if current_y < 0 or \
           current_x < 0 or \
           current_y > h - 1 or \
           current_x > w - 1:
            continue
        if ('#', current_y, current_x) not in snakes:
            if n == 0:
                yield name, current_y, current_x
            else:
                moves = get_possible_moves((current_y, current_x),
                                           snakes + [('#', current_y, current_x)],
                                           n-1,
                                           w,
                                           h)
                if list(moves):
                    yield name, current_y, current_x
                    if faster:
                        break


def split_fields(items):
    items = sorted(items, key=lambda x: {"H": 3, "#": 2, "S": 2, "o": 1}[x[0]])
    _, hy, hx = items.pop()
    yield hy, hx
    items.append(('#', hy, hx))
    yield [item for item in items if item[0] in 'S#']
    yield [item for item in items if 'o' == item[0]]


def search(brd):
    for y_index, row in enumerate(brd):
        for x_index, field in enumerate(row):
            if field in '#SHo':
                yield field, y_index, x_index


def get_distance(head, apple):
        hy, hx = head
        ay, ax = apple
        return abs(hy-ay) + abs(hx-ax)


def get_nearest_apple(head, apples):
    return sorted([(get_distance(head, (y, x)), (y, x)) for _, y, x in apples])[0][1]


def get_best_move(apple, moves):
    return sorted([(get_distance((y, x), apple), move) for move, y, x in moves])[0][1]


def move(board):
    items = search(board)
    head, snakes, apples = split_fields(items)
    moves = get_possible_moves(head, snakes, 2, len(board[0]), len(board), faster=False)
    moves = list(moves)
    if not moves:
        return None

    if apples:
        apple = get_nearest_apple(head, apples)
        move = get_best_move(apple, moves)
    else:
        move = random.choice([move for move, _, _ in moves])

    return move


def main_snake_view(request):
    board = request.POST['board'].split('\n')
    return HttpResponse(move(board))


def random_snake_view(request):
    return HttpResponse(random.choice([i for i in DIRECTIONS.keys()]))


def random_tank_view(request):
    move = random.choice(['right', 'left', 'forward', 'backward', 'fire'])
    return HttpResponse(move)
