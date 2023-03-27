import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInstructions(): string {
    return `
<h1>Todo API</h1>

<h2>Get tasks</h2>

<code>
curl http://localhost:3000/tasks
</code>


<h2>Create task</h2>

<p>
  In the example below, replace "your description" with a description of your
choosing.
</p>

<code>
curl http://localhost:3000/tasks -X POST \
  -d '{"description": "your description"}' \
  -H 'Content-Type: application/json'
</code>

<h2>Get task</h2>

<p>
  In the example below, replace "1" with an id of an existing task.
</p>

<code>
curl http://localhost:3000/tasks/1
</code>

<h2>Update task</h2>

<p>
  In the example below, replace "1" with an id of an existing task.
You can an update the description and/or status.
</p>

<code>
curl http://localhost:3000/tasks/1 -X PATCH \
  -d '{"status": "DONE"}' \
  -H 'Content-Type: application/json'
</code>

<h2>Delete task</h2>

<code>
curl http://localhost:3000/tasks/1 -X DELETE
</code>
        
`;
  }
}
